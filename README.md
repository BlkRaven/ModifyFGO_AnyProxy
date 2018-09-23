# ModifyFGO_AnyProxy
## 请捐赠支持我继续开发
![](https://github.com/heqyoufree/ModifyFGO_AnyProxy/blob/master/%E8%B5%9E%E5%8A%A9%E9%83%BD%E7%BB%99%E6%88%91%E8%B5%9E%E5%8A%A9.jpg?raw=true)  
## 建议&Bugs
[Google文档](https://docs.google.com/spreadsheets/d/167tYdMYm0Wc1kj-VgW8yna0l18jGb4jh0vsicZU3ntU/edit?usp=sharing)  
## 食用教程
### 服务端
1. 下载release的整合包  
2. 安装[Node.js](https://nodejs.org/en/download/current/)  
3. 打开命令行并按次序执行下列指令  
npm install -g nodemon(开发者可选)  
npm install -g anyproxy  
4. 双击run.bat开启  
### 客户端
#### 安装Xposed 
##### 方法1（需要Root）
1. 下载[Xposed Installer](https://forum.xda-developers.com/attachment.php?attachmentid=4393082&d=1516301692)  
2. 选择对应的包安装  
3. 安装[XFGO](https://github.com/heqyoufree/ModifyFGO_AnyProxy/raw/master/xfgo_v1.5.apk)  
4. 在Xposed Installer里激活XFGO  
5. 重启（可以使用Xposed的软重启，速度更快）  
6. 设置代理  
7. 开启服务端  
8. 在XFGO里安装证书并调整设置  
9. 开启游戏  
##### 方法2（需要第三方Recovery）
1. 下载对应系统版本和框架的[Xposed刷机包](https://dl-xda.xposed.info/framework/)  
2. 在recovery中刷入Xposed  
3. 同方法1第3步及之后
##### 方法3（测试中）
1. 安装[EXposed](https://github.com/heqyoufree/ModifyFGO_AnyProxy/raw/master/EXposed.apk)
2. 在EXposed中安装FGO
3. 安装XFGO
4. 在EXposed中激活XFGO
5. 同方法1第6步及之后
