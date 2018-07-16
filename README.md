# node-red-contrib-flowgen

Overview

## Description

flow generator for Node-RED.

## Requirement

node-red  
swagger-parser  
fs  

## Usage

```
npm i
node flowgen.js input output

ex)
node flowgen.js https://petstore.swagger.io/v2/swagger.json /tmp/flows.json
```

## Install


## Licence

Apache License 2.0

## Author

[tkhr.sait](https://github.com/tkhr-sait)

## Todo

* [ ] flow merge  
[ ] 仕様整理  
[ ] 引数:モード用意。マージ or 上書き  
[ ] 既存フロー読み込み  
[ ] 既存フローvalidate  
[ ] 既存フローとswagger付き合わせ  
[ ] 振り分け(コメントで「add/del」)  
* [ ] output example
* [ ] output swagger（node-red-node-swagger）  

## Feature

### flow merge
* 引数 -m/--merge が指定された場合
* 指定されたflowがnode-redのものかvalidateし…できんの？
* endpoint(url)  をキーにマージする  

|ケース|既存フロー|生成フロー|動作|
|-----|--------|--------|----|
|変更|有り|有り|何もしない|
|削除|有り|無し|既存フローにコメント(削除)|
|追加|無し|有り|既存フローにコメント(追加)|

[FIXME]swagger情報をhttp inに持たせる場合、
差分チェック必要
