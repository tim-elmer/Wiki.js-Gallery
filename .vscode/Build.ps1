Copy-Item "$($args[0])/src/index.html" "$($args[0])/build"
npx sass "$($args[0])/src/:$($args[0])/build/"
npx tsc