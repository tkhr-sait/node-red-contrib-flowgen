# node-red-contrib-flowgen

Overview

## Description

flow generator for Node-RED.

## Requirement

node-red  
argv-parser ... helpが出しやすいものに変更（あとで）  
swagger-parser  

## Usage

```
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
* [ ] output swagger（node-red-contrib-swaggerString）  
[ ] 振り分け(コメントで「mod」)
* [ ] output example

## Feature

### flow merge
* 引数 -m/--merge が指定された場合
* 指定されたflowがnode-redのものかvalidate
* endpoint(url)+method をキーにマージする  

|ケース|既存フロー|生成フロー|動作|
|-----|--------|--------|----|
|変更|有り|有り|何もしない[0.0.3あたりで比較追加※]|
|削除|有り|無し|既存フローにコメント(削除)|
|追加|無し|有り|生成フローにコメント(追加)|

* ※比較のためのswagger情報をhttp inに持たせる場合、node-red-node-swaggerのように
  http inに拡張情報をもたせる必要あり

### check modify
