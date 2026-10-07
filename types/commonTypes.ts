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
  alias_strength: number[];
  date_of_birth: string[];
  name_score: number;
  dob_status: string;
  final_score: number;
  reasons: string[];
}

export interface SearchResult {
  query: {
    name: string;
    normalized_name: string;
    date_of_birth: string;
    minimum_score: number;
  };
  matches_found: number;
  matches: Match[];
}
