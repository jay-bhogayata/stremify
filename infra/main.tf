terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.0"
    }
  }
  backend "s3" {
    bucket         = "stremify-tfstate"
    key            = "state/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "stremify-tfstate-lock"
  }
}


provider "aws" {
  region = "ap-south-1"
}


resource "aws_s3_bucket" "stremify_raw_vods" {
  bucket        = "stremify-raw-vods"
  force_destroy = true
  tags = {
    app : "stremify"
  }
}

resource "aws_s3_bucket_cors_configuration" "cors_for_raw_vods" {
  bucket = aws_s3_bucket.stremify_raw_vods.id
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
  }

}

resource "aws_s3_bucket" "stremify_prod_vods" {
  bucket        = "stremify-prod-vods"
  force_destroy = true
  tags = {
    app : "stremify"
  }
}

output "buckets_info" {
  value = {
    raw_vods  = aws_s3_bucket.stremify_raw_vods.bucket
    prod_vods = aws_s3_bucket.stremify_prod_vods.bucket
  }
}



