resource "aws_lambda_function" "ai_triage" {
  function_name = "${var.project}-ai-triage"
  role          = aws_iam_role.lambda_exec.arn
  filename      = data.archive_file.backend.output_path
  handler       = "ai/incidentTriage.handler"
  runtime       = "nodejs20.x"
  source_code_hash = data.archive_file.backend.output_base64sha256
  environment { variables = { SLACK_WEBHOOK_URL = var.slack_webhook_url } }
}

resource "aws_cloudwatch_event_rule" "alarm_changes" {
  name        = "${var.project}-alarm-changes"
  description = "Forward alarm state changes to AI triage"
  event_pattern = jsonencode({
    "source": ["aws.cloudwatch"],
    "detail-type": ["CloudWatch Alarm State Change"]
  })
}

resource "aws_cloudwatch_event_target" "ai_target" {
  rule      = aws_cloudwatch_event_rule.alarm_changes.name
  target_id = "ai-triage"
  arn       = aws_lambda_function.ai_triage.arn
}

resource "aws_lambda_permission" "allow_events_ai" {
  statement_id  = "AllowEventBridgeInvokeAITriage"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ai_triage.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.alarm_changes.arn
}
