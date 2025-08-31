resource "aws_iam_policy" "ddb_rw" {
  name   = "${var.project}-ddb-rw"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Action = ["dynamodb:GetItem","dynamodb:PutItem","dynamodb:Query","dynamodb:UpdateItem"],
      Resource = [aws_dynamodb_table.menu.arn, aws_dynamodb_table.orders.arn]
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_ddb" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.ddb_rw.arn
}
