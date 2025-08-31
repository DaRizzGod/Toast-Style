output "web_bucket" { value = aws_s3_bucket.web.id }
output "cloudfront_domain" { value = aws_cloudfront_distribution.web.domain_name }
output "api_base_url" { value = aws_apigatewayv2_stage.api.invoke_url }
output "menu_table" { value = aws_dynamodb_table.menu.name }
output "orders_table" { value = aws_dynamodb_table.orders.name }
output "cognito_user_pool_id" { value = aws_cognito_user_pool.users.id }
output "cognito_client_id" { value = aws_cognito_user_pool_client.web.id }
