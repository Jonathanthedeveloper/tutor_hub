#!/usr/bin/env bash

# Exit if any command fails
set -e

ENV_FILE=".env"
ENV_EXAMPLE=".env.example"

if [ ! -f "$ENV_FILE" ]; then
    echo "Creating $ENV_FILE by copying $ENV_EXAMPLE..."
    cp "$ENV_EXAMPLE" "$ENV_FILE"
fi

# Function to generate a random 32-character hex key
generate_secret() {
    openssl rand -hex 16
}

# Replace placeholders in docker.env with generated secrets
echo "Generating secure passwords and secrets in $ENV_FILE..."

sed_replace() {
    local search="$1"
    local replacement="$2"
    # Support both macOS (needs empty extension for -i) and Linux sed
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i "" "s|$search|$replacement|g" "$ENV_FILE"
    else
        sed -i "s|$search|$replacement|g" "$ENV_FILE"
    fi
}

sed_replace "placeholder_db_password" "$(generate_secret)"
sed_replace "placeholder_better_auth_secret" "$(generate_secret)"
sed_replace "placeholder_jitsi_jwt_secret" "$(generate_secret)"
sed_replace "placeholder_jicofo_component_secret" "$(generate_secret)"
sed_replace "placeholder_jicofo_auth_password" "$(generate_secret)"
sed_replace "placeholder_jvb_auth_password" "$(generate_secret)"

echo "Passwords generated successfully! Review your credentials in $ENV_FILE."
