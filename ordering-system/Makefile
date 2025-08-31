package:
	npm -C app/backend run build

# naive deploy helper; prefer doing steps manually in CI for prod
deploy: package
	cd infra && terraform apply -auto-approve
	AWS_PAGER= aws s3 sync app/frontend/out s3://$$(terraform -chdir=infra output -raw web_bucket)/ --delete
