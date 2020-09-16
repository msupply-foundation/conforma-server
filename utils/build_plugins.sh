for dir in "./src/plugins"/*; do
    (cd "$dir" && echo 'Compiling' $dir && yarn build)
done
