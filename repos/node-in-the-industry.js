
node-in-the-industry
updates the "node in the industry" section on the node homepage, by picking 4 items at random.
Send your request in the form of a pull request. It must add a folder at data/<mycompany> (where <mycompany> is the name of your company), containing a quote.html file and a logo.png file.


trumpet
parse and transform streaming html using css selectors

var trumpet = require("trumpet")
var fs = require("fs")
var path = require("path")
var index = fs.createReadStream("index.html")
var companies = fs.readdirSync(__dirname + "/data")

// pick 4 at random
var select = []
while (select.length < 4 && companies.length) {
  var i = Math.floor(Math.random() * companies.length)
  if (i === companies.length) continue
  select.push(companies[i])
  companies.splice(i, 1)
}

var html = select.map(function (company) {
  var compdir = path.resolve(__dirname, "data", company)
  var quote = path.resolve(compdir, "quote.html")
  var logo = path.relative(process.cwd(), compdir) + "/logo.png"
  return '<li class="' + company + '">' +
    '<img src="' + logo + '" alt="logo" height=34>' +
    fs.readFileSync(quote) +
    '</li>'
}).join("\n")

index.pipe(trumpet())
.select("div#quotes", function (div) {
  div.update(function () { return '<h2>Node.js in the Industry</h2><ul>' + html + '</ul><h2 style="clear:both"><a href="/industry/">More...</a></h2>' })
})
.pipe(fs.createWriteStream(".index.html"))
.on("close", function () {
  fs.rename(".index.html", "index.html")
})


shell version
(cat head.html; bash all.sh; cat foot.html) > index.html
#!/usr/bin/bash

set -e

# http://mywiki.wooledge.org/BashFAQ/026
shuffle() {
  local i tmp size max rand

  # $RANDOM % (i+1) is biased because of the limited range of $RANDOM
  # Compensate by using a range which is a multiple of the array size.
  size=${#array[@]}
  max=$(( 32768 / size * size ))

  for ((i=size-1; i>0; i--)); do
    while (( (rand=$RANDOM) >= max )); do :; done
    rand=$(( rand % (i+1) ))
    tmp=${array[i]} array[i]=${array[rand]} array[rand]=$tmp
  done
}

array=($(echo data/*))
if [ "$NOSHUFFLE" != "1" ]; then
  shuffle
fi

for company in "${array[@]}"; do
  name=${company#data/}
  img=$company/logo.png
  quote=$company/quote.html
  cat <<END
  <div class="row clearfix" id="$name">
    <p><img src="$img" height=34 alt="$name"></p>
END
  cat $quote
  cat <<END
  </div>
END
done

