data "archive_file" "backend" {
  type        = "zip"
  source_dir  = "${path.module}/../app/backend/dist"
  output_path = "${path.module}/backend.zip"
}

resource "aws_iam_role" "lambda_exec" {
  name = "${var.project}-lambda-exec"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = { Service = "lambda.amazonaws.com" },
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "get_menu" {
  function_name = "${var.project}-get-menu"
  role          = aws_iam_role.lambda_exec.arn
  filename      = data.archive_file.backend.output_path
  handler       = "handlers/getMenu.handler"
  runtime       = "nodejs20.x"
  source_code_hash = data.archive_file.backend.output_base64sha256
  environment { variables = { MENU_TABLE = aws_dynamodb_table.menu.name } }
}

resource "aws_lambda_function" "stripe_webhook" {
  function_name = "${var.project}-stripe-webhook"
  role          = aws_iam_role.lambda_exec.arn
  filename      = data.archive_file.backend.output_path
  handler       = "handlers/stripeWebhook.handler"
  runtime       = "nodejs20.x"
  source_code_hash = data.archive_file.backend.output_base64sha256
  environment { variables = { ORDERS_TABLE = aws_dynamodb_table.orders.name } }
}

resource "aws_apigatewayv2_api" "api" {
  name          = "${var.project}-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_credentials = false
    allow_headers     = ["*"]
    allow_methods     = ["GET", "POST", "OPTIONS"]
    allow_origins     = ["*"]
  }
}

resource "aws_apigatewayv2_integration" "get_menu" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.get_menu.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_menu" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /menu"
  target    = "integrations/${aws_apigatewayv2_integration.get_menu.id}"
}

resource "aws_apigatewayv2_integration" "stripe_webhook" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.stripe_webhook.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "stripe_webhook" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /stripe/webhook"
  target    = "integrations/${aws_apigatewayv2_integration.stripe_webhook.id}"
}

resource "aws_lambda_permission" "apigw_getmenu" {
  statement_id  = "AllowAPIGwInvokeGetMenu"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_menu.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "apigw_webhook" {
  statement_id  = "AllowAPIGwInvokeWebhook"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stripe_webhook.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_apigatewayv2_stage" "api" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}
