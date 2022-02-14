ts-node './utils/release.ts'

tag=$(cat tag)
rm tag

if [ "$tag" != "" ]; then
    cd docker && ./dockerise.sh $tag push
fi
