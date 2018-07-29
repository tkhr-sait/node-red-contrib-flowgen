# node-red-contrib-flowgen

[![Build Status](https://travis-ci.org/tkhr-sait/node-red-contrib-flowgen.svg?branch=master)](https://travis-ci.org/tkhr-sait/node-red-contrib-flowgen)

Overview

## Description

flow generator for Node-RED.  
for BFF(Backends For Frontends) skelton or web api mock(limited...)

## Requirement

node-red  
argparse  
swagger-parser  
dateformat  

## Install

```
npm i -g node-red-contrib-flowgen
```

## Usage

```
usage: flowgen [-h] [-v] -i INPUT -o OUTPUT [-f FLOWNAME] [-m] [-V] [-s]

flow generator for Node-RED

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -i INPUT, --input INPUT
                        swagger.json input
  -o OUTPUT, --output OUTPUT
                        flows.json output
  -f FLOWNAME, --flowName FLOWNAME
                        flowName default: Swagger API
  -m, --merge           merge mode
  -V, --validate        with validation
  -s, --swaggerDocOutput
                        create node-red-node-swagger node

ex)
flowgen -i input -o output

ex)
flowgen -i https://petstore.swagger.io/v2/swagger.json -o /tmp/flows.json

ex) merge
flowgen -i /path/to/swagger.json -o /tmp/flows.json -m

ex) with SwaggerDoc
flowgen -i /path/to/swagger.json -o /tmp/flows.json -m -s

```

## Licence

Apache License 2.0

## Author

[tkhr.sait](https://github.com/tkhr-sait)

## Feature

### flow merge

* 引数 -m/--merge が指定された場合
* 指定されたflowがnode-redのものかcheck.なければtabを作る
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

### example

* swagger.jsonの内容をもとにレスポンスを生成。exampleが存在する場合、利用する
* 定義の一番上のステータスコードのレスポンスを出力する
* statusCodeがdefaultの場合、200に置き換える

### node-red-node-swagger

* 引数 -s/--swaggerDocOutput が指定された場合
* swagger.jsonの内容をもとに'http in'ノードの SwaggerDoc を生成する
* ただし、object型は対応していないので生成しない、array型も中途半端となる可能性があるので生成しない
* responseは対応しない(statusCodeのみ対応する)

### http-in Node

* パラメータの受取について

|type    |data          |node-red             |
|--------|--------------|---------------------|
|path    |/url/:hoge    |msg.req.params.hoge  |
|header  |hoge=fuga     |msg.req.headers.hoge |
|query   |/url?hoge=huga|msg.req.query.hoge   |
|formData|{hoge: fuga}  |msg.payload.hoge     |

## Todo

* [x] flow merge  
[x] 仕様整理  
[x] 引数:モード用意。マージ or 上書き  
[x] 既存フロー読み込み  
[x] 既存フローcheck  
[x] 既存フローとswagger付き合わせ  
[x] 振り分け(コメントで「add/del」)  
* [x] output swagger  
[x] 振り分け(コメントで「mod」)  
[x] node-red-node-swaggerのように、既存ノードの拡張をする仕掛けを調査...node-red本体に項目用意してるので真似できない...outputLabelsでやる  
* [x] output example
* [x] node-red-node-swagger
* [x] brush up  
[x] コメント２重表示の防止  
[x] refactoring  
[x] test  
[x] url parameter bugfix  
[x] refactoring2  
[x] test2  
[ ] refactoring3  
[ ] test3  
