# Watchlist Screening Application

A sanctions screening application built with **Next.js**, **AWS Lambda**, **Amazon API Gateway**, and **Amazon S3**.

The application supports:

- single-name sanctions screening
- batch CSV screening
- sanctions watchlist uploading and preprocessing
- name normalization
- character n-gram candidate filtering
- Jaro-Winkler fuzzy matching
- optional date-of-birth matching
- dynamically configurable score thresholds
- match explanations
- evaluation using labelled test data
- precision and recall measurement
- backend testing with pytest

---

## Tech Stack

### Frontend

- Next.js
- App Router
- TypeScript
- Tailwind CSS

### Backend

- Python 3.12
- AWS Lambda
- Amazon API Gateway
- Amazon S3

### Testing

- pytest

---

## Architecture

```text
Browser
   ↓
Next.js
   ↓
Next.js Server Route
   ↓
Amazon API Gateway
   ↓
AWS Lambda
   ↓
Amazon S3
```

AWS credentials are not exposed in the browser.

---

## Main Features

### Uploading Sanctions Watchlist

Before proceeding with the screening, ensure you obtain the Sanctions List CSV file from the [GOV.UK](https://www.gov.uk/government/publications/the-uk-sanctions-list) or click [here](https://sanctionslist.fcdo.gov.uk/docs/UK-Sanctions-List.csv) to download it directly.

### Single Screening

Users can screen a single name against the processed sanctions watchlist.

Inputs:

- name
- optional date of birth
- minimum score threshold

The response includes:

- matched watchlist subject
- matched name
- watchlist unique ID
- designation type
- regime names
- name score
- DOB status
- final score
- explanation of why the candidate matched

### Batch Screening

Example CSV:

```csv
reference_id,name,date_of_birth
CUST001,John Smith,10/05/1980
CUST002,Jane Doe,
```

Required column:

```text
name
```

Optional columns:

```text
reference_id
date_of_birth
```

If `reference_id` is missing, a fallback value such as `ROW_2` is generated.

Rows without a name are reported as failed rows instead of being screened.

### Evaluation

A labelled CSV can be uploaded to evaluate matching quality.

```csv
reference_id,name,date_of_birth,expected_match_id
TEST001,Abdul Kabir MOHAMMAD JAN,30/01/1972,AFG0007
TEST002,Example Person,,
```

If `expected_match_id` contains a watchlist ID, that subject is expected to be found.

If the field is empty, no sanctions match is expected.

Evaluation metrics include:

- True Positives
- False Positives
- False Negatives
- True Negatives
- Precision
- Recall

The frontend presents them as:

```text
True Positive  → Correctly Found
False Positive → False Alarms
False Negative → Missed
True Negative  → Correctly Clear
```

---

## Watchlist Processing

Subjects are grouped using `Unique ID`.

The processed watchlist retains:

- Unique ID
- Designation Type
- Regime Name
- Names and aliases
- Name Type
- Alias Strength
- Date of Birth

`Unique ID` is required. Any subject missing a `Unique ID` will be treated as a failed row during parsing.

Subjects without usable `Name 1` to `Name 6` values are skipped.

The processed watchlist is stored in S3 as JSON.

Example processed name:

```json
{
  "normalized": "abdul kabir mohammad jan",
  "ngrams": ["abd", "bdu", "dul"],
  "original_variants": ["Abdul Kabir MOHAMMAD JAN"],
  "name_type": ["Primary Name"],
  "alias_strength": []
}
```

---

## Name Normalization

Normalization:

- converts text to lowercase
- decomposes Unicode characters
- removes accents and combining marks
- replaces punctuation with spaces
- replaces underscores with spaces
- collapses repeated whitespace
- trims surrounding whitespace

Example:

```text
Input:
  Jöhn-SMÍTH, Jr.

Normalized:
john smith jr
```

---

## N-Gram Candidate Filtering

Character trigrams are used as a candidate filtering step before Jaro-Winkler.

Example:

```text
mounir

mou
oun
uni
nir
```

Watchlist n-grams are generated during watchlist processing and stored in the processed JSON file.

During screening:

1. Normalize the input name.
2. Generate input n-grams once.
3. Compare them with stored watchlist n-grams.
4. Reject candidates below the n-gram threshold.
5. Run Jaro-Winkler only on surviving candidates.

Example:

```text
Total aliases: 15444
Rejected by n-gram: 15388
Jaro-Winkler comparisons: 55
```

---

## Name Matching Flow

```text
Normalize input
      ↓
Generate input n-grams
      ↓
N-gram candidate filtering
      ↓
Exact normalized-name check
      ↓
Jaro-Winkler similarity
      ↓
DOB comparison
      ↓
Final score
      ↓
Minimum-score filtering
```

---

## Date of Birth Matching

Supported patterns include:

```text
30/01/1972
1972-01-30
1972
dd/05/1960
04/mm/1960
```

Possible statuses:

```text
MATCH
PARTIAL_MATCH
NEAR_MATCH
NO_MATCH
NOT_PROVIDED
NOT_AVAILABLE
INVALID_INPUT
```

If DOB is not provided, the final result is based on the name score.

---

## Precision and Recall

```text
Precision = TP / (TP + FP)
Recall    = TP / (TP + FN)
```

Example:

```text
Precision: 43%
Recall: 97%
```

This means the matcher finds most expected matches but also raises a number of false alarms.

---

# Setup

## Prerequisites

Install:

- Node.js
- npm
- Git
- AWS account access
- AWS Lambda access
- Amazon API Gateway access
- Amazon S3 access

The backend Lambda runtime is **Python 3.12**.

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-folder>
```

---

# Frontend Setup

## 2. Install Dependencies

From the Next.js project directory:

```bash
npm install
```

## 3. Configure Environment Variables

Create `.env.local` in the Next.js project root:

```env
AWS_API_GATEWAY_URL=https://your-api-id.execute-api.your-region.amazonaws.com/your-stage
```

This is the only frontend environment variable required by the current application.

Do **not** prefix it with `NEXT_PUBLIC_` because it is only used by Next.js server-side routes.

## 4. Run the Frontend

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 5. Production Build

```bash
npm run build
npm start
```

---

# AWS Backend Setup

## 6. Create an S3 Bucket

Use the bucket for:

- raw watchlist uploads
- processed watchlist JSON
- batch input CSV files

Example keys:

```text
watchlist/raw/sanction.csv
watchlist/processed/watchlist.json
batch/input/<generated-id>.csv
```

Update Lambda Environment Variables:

```python
BUCKET_NAME = os.environ["BUCKET_NAME"]

RAW_FILE_KEY = os.environ.get(
    "RAW_FILE_KEY",
    "watchlist/raw/sanction.csv",
)

CLEAN_FILE_KEY = os.environ.get(
    "CLEAN_FILE_KEY",
    "watchlist/processed/watchlist.json",
)
```

Update Lambda constants:

```python
TEMP_FILE_PATH = "/tmp/sanction.csv"
BATCH_TEMP_PATH = "/tmp/batch.csv"
EVALUATION_TEMP_PATH = "/tmp/evaluation.csv"
```

## 7. Create the Lambda Function

Create a Lambda using:

```text
Python 3.12
```

Typical backend files:

```text
lambda_function.py
csv_parse.py
name_matching.py
parse_batch_csv.py
```

Handler example:

```text
lambda_function.lambda_handler
```

## 8. Configure Lambda Permissions

The Lambda execution role needs access to the S3 bucket for the required read/write operations.

Use least-privilege permissions where possible.

## 9. Configure Memory and Timeout

Suggested development settings:

```text
Memory: 512 MB or higher
Timeout: 120 seconds
```

## 10. Create API Gateway

Create an API Gateway endpoint connected to the Lambda.

The Lambda supports actions such as:

```text
get-upload-url
validate
search
get-batch-upload-url
batch-screen
get-evaluation-upload-url
evaluate
run-tests
```

Configure API Gateway to invoke Lambda using `POST`.

After deployment, copy the invoke URL into:

```env
AWS_API_GATEWAY_URL=<your-api-gateway-url>
```

---

# Watchlist Setup

## 11. Upload the Sanctions CSV

Upload the raw sanctions CSV to:

```text
watchlist/raw/sanction.csv
```

The application can use a presigned S3 upload URL.

## 12. Validate and Process the Watchlist

The backend:

1. downloads the raw CSV
2. detects the header
3. groups records by `Unique ID`
4. extracts usable names
5. normalizes names
6. precomputes n-grams
7. parses DOB values
8. records skipped/failed subjects
9. writes the processed watchlist to S3

Processed output:

```text
watchlist/processed/watchlist.json
```

This processed file must exist before screening.

---

# Batch Screening

The frontend sends:

- CSV file
- `minimum_score`

to a Next.js server route.

The server route:

1. requests a presigned S3 URL from Lambda
2. uploads the CSV to S3
3. sends the generated S3 key and threshold to Lambda
4. receives and returns the screening result

---

# Evaluation

Evaluation CSV format:

```csv
reference_id,name,date_of_birth,expected_match_id
TEST001,Abdul Kabir MOHAMMAD JAN,30/01/1972,AFG0007
TEST002,Example Person,,
```

The parser treats a CSV as an evaluation file when it contains:

```text
expected_match_id
```

After screening, `evaluate_batch()` calculates:

- true positives
- false positives
- false negatives
- true negatives
- precision
- recall

---

# Testing

Example structure:

```text
tests/
├── test_normalize.py
├── test_ngrams.py
├── test_jaro_winkler.py
├── test_dob_matcher.py
├── test_scoring.py
├── test_matching.py
├── test_batch.py
└── test_evaluation.py
```

Tests cover:

- normalization (removes punctuation, accents and whitespace)
- n-gram generation and similarity
- Jaro-Winkler similarity
- DOB parsing and comparison
- final score calculation
- exact matching and fuzzy matching
- threshold filtering
- evaluation metrics

---

# Example Lambda Test Events

## Single Search

```json
{
  "body": "{\"action\":\"search\",\"name\":\"Abdul Kabir MOHAMMAD JAN\",\"date_of_birth\":\"30/01/1972\",\"minimum_score\":90}"
}
```

## Batch Search

```json
{
  "body": "{\"action\":\"batch-screen\",\"file_key\":\"batch/input/{uuid}.csv\",\"minimum_score\":90}"
}
```

---

# Security Notes

- AWS credentials are not exposed in the browser.
- The frontend only requires `AWS_API_GATEWAY_URL`.
- `AWS_API_GATEWAY_URL` is server-side only.
- S3 uploads use presigned URLs.
- Batch files use generated object keys.
- Production IAM permissions should follow least-privilege principles.

---

# Screenshots

Some images of the application
<img width="1870" height="851" alt="single" src="https://github.com/user-attachments/assets/c2af5382-f451-46d0-881b-18fabe91d2e3" />
<img width="1881" height="832" alt="upload2" src="https://github.com/user-attachments/assets/8eef9345-fc70-4a7d-bd78-a6e7350df064" />
<img width="1865" height="855" alt="upload" src="https://github.com/user-attachments/assets/fe7f1225-ac4d-4bec-b4cc-ae3bd8c509fa" />
<img width="1863" height="703" alt="batch1" src="https://github.com/user-attachments/assets/f0dcc692-2c79-43f8-95b4-a742b7b26eea" />
<img width="1873" height="852" alt="batch2" src="https://github.com/user-attachments/assets/9ab9a51d-bf16-4017-9c33-80ddbf7c8b90" />
<img width="1872" height="852" alt="evaluate1" src="https://github.com/user-attachments/assets/4347e664-b5a0-4af5-bf0f-b73ce92a96f8" />
<img width="1853" height="851" alt="evaluate2" src="https://github.com/user-attachments/assets/a09edbc9-8d9e-4be4-bfd2-63f1bde13832" />


