#!/usr/bin/env bash
set -euo pipefail

: "${IMAGE_TAG:?}"
: "${INSTANCE_ID:?}"
: "${AWS_REGION:?}"
: "${DOCUMENT:?}"

command_id=$(aws ssm send-command \
	--region "$AWS_REGION" \
	--instance-ids "$INSTANCE_ID" \
	--document-name "$DOCUMENT" \
	--comment "deploy console $IMAGE_TAG" \
	--parameters "imageTag=$IMAGE_TAG" \
	--query Command.CommandId --output text)

echo "ssm command: $command_id"

status=Pending
for _ in $(seq 1 60); do
	status=$(aws ssm get-command-invocation \
		--region "$AWS_REGION" \
		--command-id "$command_id" \
		--instance-id "$INSTANCE_ID" \
		--query Status --output text 2>/dev/null || echo Pending)
	case "$status" in
	Success | Failed | Cancelled | TimedOut) break ;;
	esac
	sleep 5
done

aws ssm get-command-invocation --region "$AWS_REGION" \
	--command-id "$command_id" --instance-id "$INSTANCE_ID" \
	--query StandardOutputContent --output text

aws ssm get-command-invocation --region "$AWS_REGION" \
	--command-id "$command_id" --instance-id "$INSTANCE_ID" \
	--query StandardErrorContent --output text >&2

if [ "$status" != "Success" ]; then
	echo "::error::console deploy finished with status $status"
	exit 1
fi

echo "deployed console $IMAGE_TAG"
