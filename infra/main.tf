terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.0"
    }
  }
  backend "s3" {
    bucket         = "stremify-tfstate"
    key            = "stremify-backend/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "stremify-tfstate-lock"
  }
}


provider "aws" {
  region = "ap-south-1"
}

data "aws_vpc" "default" {
  default = true
}


resource "aws_db_instance" "rdb" {
  identifier        = "stremify"
  allocated_storage = 20
  storage_type      = "gp2"
  engine            = "postgres"
  engine_version    = "16.1"
  instance_class    = "db.t3.micro"
  db_name           = var.pg_db_name
  username          = var.pg_db_username
  password          = var.pg_db_password

  publicly_accessible = true
  skip_final_snapshot = true

}

resource "aws_security_group" "postgres_sg" {
  name        = "postgres_sg"
  description = "Allow inbound traffic on port 5432 from anywhere"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


output "rdb_endpoint" {
  value     = aws_db_instance.rdb.endpoint
  sensitive = true
}
