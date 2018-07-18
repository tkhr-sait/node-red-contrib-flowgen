# node-red-contrib-flowgen

Overview

## Description

flow generator for Node-RED.

## Requirement

node-red  
argparse
swagger-parser  

## Usage

```
usage: flowgen.js [-h] [-v] -i INPUT -o OUTPUT [-f FLOWNAME] [-m]

flow generator for Node-RED

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -i INPUT, --input INPUT
                        swagger.json input
  -o OUTPUT, --output OUTPUT
                        flows.json output
  -f FLOWNAME, --flowName FLOWNAME
                        flowName default='Swagger API'
  -m, --merge           merge mode


ex)
npm i
node flowgen.js -i input -o output

ex)
node flowgen.js -i https://petstore.swagger.io/v2/swagger.json -o /tmp/flows.json

ex) merge
node flowgen.js -i /path/to/swagger.json -o /tmp/flows.json -m

```

## Install


## Licence

Apache License 2.0

## Author

[tkhr.sait](https://github.com/tkhr-sait)

## Todo

* [x] flow merge  
[x] 仕様整理  
[x] 引数:モード用意。マージ or 上書き  
[x] 既存フロー読み込み  
[x] 既存フローcheck  
[x] 既存フローとswagger付き合わせ  
[x] 振り分け(コメントで「add/del」)  
* [x] output swagger（node-red-contrib-swaggerString）  
[x] 振り分け(コメントで「mod」)
[x] node-red-node-swaggerのように、既存ノードの拡張をする仕掛けを調査...node-red本体に項目用意してるので真似できない...outputLabelsでやる
* [ ] output example
* [ ] node-red-node-swagger

## Feature

### flow merge

* 引数 -m/--merge が指定された場合
* 指定されたflowがnode-redのものかvalidate
* endpoint(url)+method をキーにマージする  

|ケース|既存フロー|生成フロー|動作|
|-----|--------|--------|----|
|変更|有り|有り|変更ありの場合、既存フローにコメント(変更)|
|削除|有り|無し|既存フローにコメント(削除)|
|追加|無し|有り|生成フローにコメント(追加)|

### check modify

* 引数 -m/--merge が指定された場合
* 比較のためのswagger情報はhttp inのoutputLabelsに持つ
* 'http in'ノードのoutputLabelsにswagger定義を入れておき、再生成の際に比較して変更検知
