export type DobStatus =
  | "MATCH"
  | "PARTIAL_MATCH"
  | "NEAR_MATCH"
  | "NO_MATCH"
  | "NOT_PROVIDED"
  | "NOT_AVAILABLE"
  | "INVALID_INPUT";

export interface ValidationIssue {
  row: number;
  unique_id: string;
  severity: "ERROR" | "WARNING";
  code: string;
  message: string;
}

export interface Match {
  unique_id: string;
  designation_type: string;
  regime_names: string[];
  matched_name: string;
  name_type: string[];
  alias_strength: string[];
  date_of_birth: string[];
  name_score: number;
  dob_status: DobStatus;
  final_score: number;
  reasons: string[];
}

export interface SearchResult {
  query: {
    name: string;
    normalized_name: string;
    date_of_birth: string | null;
    minimum_score: number;
  };
  matches_found: number;
  matches: Match[];
}

export interface BatchScreenResult {
  row: number;
  reference_id: string;
  expected_mathch_id?: string | null;
  input: {
    name: string;
    normalized_name: string;
    date_of_birth: string | null;
  };
  matches_found: number;
  matches: Match[];
}

export interface BatchScreenError {
  row: number;
  reference_id: string | null;
  code: string;
  message: string;
}

export interface BatchScreenResponse {
  is_evaluation: boolean;
  summary: {
    total_rows: number;
    screened_rows: number;
    failed_rows: number;
    rows_with_matches: number;
    rows_without_matches: number;
    minimum_score: number;
  };
  results: BatchScreenResult[];
  errors: BatchScreenError[];
}

export type EvaluationStatus =
  | "TRUE_POSITIVE_WITH_FALSE_ALARMS"
  | "TRUE_POSITIVE"
  | "FALSE_NEGATIVE"
  | "FALSE_POSITIVE"
  | "TRUE_NEGATIVE";

export interface EvaluationDetails {
  row_number: number;
  reference_id: string;
  expected_match_id: string | null;
  expected_match_found: boolean;
  actual_match_ids: string[];
  false_alarm_ids: string[];
  status: EvaluationStatus;
}

export interface EvaluationMetrics {
  true_positives: number;
  false_positives: number;
  false_negatives: number;
  true_negatives: number;
  precision: number;
  recall: number;
}

export interface EvaluationResponse extends BatchScreenResponse {
  is_evaluation: true;
  evaluation: {
    metrics: EvaluationMetrics;
    details: EvaluationDetails[];
  };
}
