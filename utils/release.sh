branch=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')
VERSION_ARG=${1:---prerelease}

# Get variables from .env
export $(grep -v '^#' .env | xargs)

printf "You are about to create a new version of type: \"$VERSION_ARG\" on branch $branch\n\n"

printf "Please ensure you have added the front-end file path to your .env file and the front-end has the correct branch checked out.\n\nAre you sure you wish to proceed?"

read -p "(Y/n) " response

if ! [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    exit 1
else
    yarn version $VERSION_ARG
    git push --tags
    printf "Switching to front-end repo...\n"
    cd ${FRONT_END_PATH}
    yarn version $VERSION_ARG
    git push
fi

# Bump version
# - Check arg  (patch, minor, major, prerelase)
# If not present, ask version from command line
# Bump version
# Tag auto-created

# Push to git, make sure tags pushed

# Switch to front-end folder and do the same.
