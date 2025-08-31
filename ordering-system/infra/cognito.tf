resource "aws_cognito_user_pool" "users" {
  name = "${var.project}-users"
  auto_verified_attributes = ["email"]
  schema { attribute_data_type = "String" name = "email" required = true mutable = true }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${var.project}-web"
  user_pool_id = aws_cognito_user_pool.users.id
  generate_secret = false
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
  callback_urls = ["http://localhost:3000", "https://${aws_cloudfront_distribution.web.domain_name}"]
  logout_urls   = ["http://localhost:3000", "https://${aws_cloudfront_distribution.web.domain_name}"]
  supported_identity_providers = ["COGNITO"]
}
