variable "pg_db_name" {
  description = "name of postgres database"
  type        = string
  sensitive   = false
}

variable "pg_db_username" {
  description = "username for the postgres database"
  type        = string
  sensitive   = true
}

variable "pg_db_password" {
  description = "password for the postgres database"
  type        = string
  sensitive   = true
}
