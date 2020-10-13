for dir in "./src/plugins"/*; do
    (cd "$dir" && yarn install && echo 'Compiling' $dir && yarn build)
done
