#!/usr/bin/env bash

set -e

usage() { echo "Usage: $0 [-u nexus username] [-p nexus password] [-n docker_regsitery_url]" 1>&2; exit 1; }

function die() {
  echo "$*" 1>&2
  exit 1
}

# common variables
service_name="restool-ui"
group="restool"


current_branch=$(git symbolic-ref --short HEAD)
check_uncommit=$(git status --porcelain 2>/dev/null| egrep "^(M| M)" | wc -l)

# if [[ "${check_uncommit}" -ne 0 ]]; then
#     die "un comitted files existing"
# fi

while getopts ":u:p:n:" opt; do
  case $opt in
    u) username="$OPTARG"
    ;;
    p) password="$OPTARG"
    ;;
    n) docker_regsitery_url="$OPTARG" 
    ;;
    \?) echo "Invalid option -$OPTARG" >&2
    ;;
  esac
done

if [[ -z "$docker_regsitery_url" ]]; then
   docker_regsitery_url="registry.hub.docker.com"
fi
echo $username $docker_regsitery_url

function bump_files() {
	bump package.json "\"version\": \"$1\"" "\"version\": \"$2\""
}

# TODO need to clean up the package.json-e deletion
function bump() {
	echo -n "Updating $1 $2 $3..."
	tmp_file=$(mktemp)
	rm -f "$tmp_file"
	sed -i -e "s/$2/$3/1w $tmp_file" $1
    # sed -i "s|$2|$3|g" $1
	if [ -s "$tmp_file" ]; then
		echo "Done"
	else
		echo "Nothing to change"
	fi
    echo $tmp_file
	rm -f "$tmp_file"
    rm -f package.json-e
}

function get_new_version() {
  current_branch=$2
  IFS='.' read -a version_parts <<< "$1"
  major=${version_parts[0]}
  minor=${version_parts[1]}
  patch=${version_parts[2]}

  IFS='-' read -a patch_parts <<< "$patch"

  patch_main_no=${patch_parts[0]}
  patch_branch=${patch_parts[0]}
  patch_no=${patch_parts[2]}

  if [ -z "$patch_no" ]
  then
      patch_no=1
  else
      patch_no=$((patch_no + 1))
  fi

  if [[ "${current_branch}" == "master" ]]; then
    patch=$((patch_main_no + 1))
  else
    patch=$patch_main_no-$current_branch-$patch_no
  fi

  new_version="$major.$minor.$patch"
  echo "$new_version"
}


current_version=`grep '"version":' package.json -m1 | cut -d\" -f4`
new_version=$(get_new_version $current_version $current_branch)


while [ ! -z "$(git ls-remote origin refs/tags/v$new_version)" ]
do
   echo $new_version
   new_version=$(get_new_version $new_version $current_branch)
done

echo "$current_version" "$new_version"

bump_files "$current_version" "$new_version"

new_tag="v$new_version"

docker build -t $service_name:$new_version .

if [[ -z $username ]] || [[ -z $password ]]; then  
  die "local docker genrated"
fi

docker tag $service_name:$new_version $docker_regsitery_url/$group/$service_name:$new_version

docker login $docker_regsitery_url -u=$username -p=$password
docker push $docker_regsitery_url/$group/$service_name:$new_version


echo "Committing changed files..."
git add --all
git commit -m "new docker genrated with version: $new_version" --no-verify

echo "Adding new tag tag: $new_tag..."
git tag "$new_tag"

echo "Pushing branch $current_branch and tag $new_tag upstream..."
git push origin $current_branch 
git push origin $new_tag

