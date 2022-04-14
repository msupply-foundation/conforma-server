ts-node './utils/release.ts' $1

tag=$(cat tag)
rm tag

if [ "$tag" != "" ]; then
    cd docker && ./dockerise.sh $tag push
fi
