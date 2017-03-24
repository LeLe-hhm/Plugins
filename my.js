  (function(window, undefined) {

      var arr = [],
          slice = arr.slice,
          push = arr.push;
      // 用一个变量push来定义数组的push方法，让之后的push直接有数组调用

      // 如果出现了错误 那么就重写 push
      try {
          var div = document.createElement('div');
          div.innerHTML = '<p></p>';
          var arr = [];
          push.apply(arr, div.getElementsByTagName('p'));
      } catch (e) {
          // IE低版本中  对维数组不能使用push.apply方法
          push = {
              // arr1 arr2 都有可能是维数组
              apply: function(arr1, arr2) {
                  for (var i = 0; i < arr2.length; i++) {
                      // 把数组arr2中的值加入到arr1 中
                      // arr1 arr2 都是维数组 没 ++ 会出错
                      arr1[arr1.length++] = arr2[i];
                  }
              }
          };
      }


      function itcast(html) {
          // 在itcast.prototype.init 上创建一个实例
          return new itcast.prototype.init(html);
      }
      // 在itcast原型上添加方法
      // 方便书写； itcast.fn = itcast.prototype 
      itcast.fn = itcast.prototype = {
              // 构造函数是 itcast
              constructor: itcast,
              // 为什么要写 length: 0 ?
              // 如果html传入为空，返回的this 什么属性都没有，不能查看出这个对象是什么 （维数组）
              // 循环遍历的时候， this.length 为undefined 浏览器虽然默认会转换。但又有可能会报错
              // 所以要加上length: 0 
              length: 0,
              // 用来保存选择器字符串
              selector: '', //表示使用了selector选择器
              // 用来表示对象是itcast对象
              type: 'itcast',
              init: function(html) {
                  // 如果传入的参数 为空或空字符串 直接return
                  if (html == null || html === '') {
                      return; //返回this 空对象
                  }
                  // 传入的是 事件函数  
                  if (typeof html === 'function') {
                      // 怎么处理事件追加？
                      // 将onload事件处理事件处理的内容存放到变量oldFn中
                      var oldFn = window.onload;
                      // 如果oldFn是一个函数，代表之前onload有对应的事件处理函数
                      if (typeof oldFn === 'function') {
                          // 为onload事件绑定函数
                          window.onload = function() {
                                  // 执行调用之前的函数
                                  oldFn();
                                  // 再调用新传入的函数
                                  html();
                              }
                              // 如果oldFn不是一个函数，说明之前onload没有做事件函数
                      } else {
                          // 那么就将html设置为onload事件的处理函数
                          window.onload = html;
                      }
                  }
                  // 传入的是字符串
                  // isString( html )
                  if (typeof html === 'string') {
                      if (/^</.test(html)) {
                          // 用正则检测 < 括号 说明传入的是 标签 
                          push.apply(this, parseHTML(html));
                      } else {
                          // 否则 传入的是选择器  则调用 select 函数
                          push.apply(this, itcast.select(html));
                          // 保存选择器字符串到selector中
                          this.selector = html;
                      }
                  }
                  // selector属性
                  // 传入的html 是一个itcast对象
                  if (html && html.type === 'itcast') {
                      // 将传入的itcast 对象所有的元素都加到this中
                      push.apply(this, html);
                      // 复制selector属性
                      this.selector = html.selector;
                  }
                  // 如果html参数是一个dom元素，那么这个元素就拥有nodeType属性
                  if (html && html.nodeType) {
                      // domy元素转化为itcast对象
                      /*this[0] = html; //this 是创建的实例维数组 length不会自己加
                      // 当我们对itcast对象去设置0下标的时候
                      // 只是将0下标的元素设置为了dom对象，并不会修改length属性
                      // 所以我们要手动加
                      this.length = 1;
                      */
                      push.call(this, html);
                      // this: {0:HTMLDivElement, length:1}
                  }
              }
          }
          // 在itcast.prototype.init 上创建的实例 
          // 不能使用itcast.prototype 上的方法
          // 怎么才能使用？？
          // 将init的原型和itcast的原型指向一致，然后给itcast的原型添加方法，init也会有
      itcast.fn.init.prototype = itcast.fn;

      // select函数： 选择器
      var select =
          (function() {
              // 正则表达式
              // 匹配 传入的是 # 或  .  或者标签
              //                       1           2         3     4
              var rbaseselector = /^(?:\#([\w\-]+)|\.([\w\-]+)|(\*)|(\w+))$/;
              // 系统方法函数体是 [native code] 的形式，用正则匹配
              var rnative = /\{\s*\[native/;
              // 去除空格的正则
              var rtrim = /^\s+|\s+$/g;


              // 方法定义检测
              var support = {};
              // 检测系统方法 有这个方法则为 true 否则为 false
              support.qsa = rnative.test(document.querySelectorAll + "");
              support.getElementsByClassName = rnative.test(document.getElementsByClassName + "");
              support.trim = rnative.test(String.prototype.trim + "");
              support.indexOf = rnative.test(Array.prototype.indexOf + "");
              //测试 低版本浏览器使用
              // support.getElementsByClassName = false;
              // support.qsa = false;
              // support.trim = false;
              // support.indexOf = false;

              // 去除字符串两端的空格
              function myTrim(str) {
                  if (support.trim) {
                      // 系统自带方法 去掉收尾空格
                      return str.trim();
                  } else {
                      //自己写代码  用正则去除空格 
                      return str.replace(rtrim, '');
                  }
              }
              // 实现indexOf方法兼容：  在数组array中查找search元素，有返回1 没有返回-1
              // startIndex 表示从第几个元素开始查找
              function myIndexOf(array, search, startIndex) {
                  startIndex = startIndex || 0;
                  if (support.indexOf) {
                      // 系统有这个方法 直接在array中查找search
                      return array.indexOf(search);
                  } else {
                      //没有这个方法  遍历每一个元素
                      for (var i = startIndex; i < array.length; i++) {
                          if (array[i] === search) {
                              // 数组中能找到这个元素 那就返回这个元素在数组中的索引
                              return i;
                          }
                      }
                      // 没有这个值就返回 -1
                      return -1;
                  }
              }
              // 去除数组中的重复出现的元素
              function unique(array) {
                  var res = [];
                  for (var i = 0; i < array.length; i++) {
                      // 在res中是否有array[i]这个元素，没有就加入到res中
                      // ==-1 说明res中还没有这个元素
                      if (myIndexOf(res, array[i]) == -1) {
                          res.push(array[i]); //没有这项就传入res
                      }
                  }
                  return res;
              }
              // 基本方法 getClassName 获取类名
              function getClassName(className, node, results) {
                  node = node || document;
                  results = results || [];
                  var tag,
                      i;
                  // 判断系统是否有 getElementsByClassName 方法
                  if (support.getElementsByClassName) {
                      push.apply(results, node.getElementsByClassName(className));
                      return results;
                  } else {
                      // 没有 模仿jQ 方式处理
                      // 首先获取页面所有元素
                      tag = node.getElementsByTagName("*");
                      // 对元素进行遍历
                      for (i = 0; i < tag.length; i++) {
                          // 匹配 类名
                          // 把classList头尾都加上空格之后再用字符串的indexOf查找
                          // 数组的indexOf  方法有兼容性问题
                          if (("" + tag[i].className + "").indexOf("" + className + "") != -1) {
                              // 符合的 就加入到数组results 中
                              results.push(tag[i]);
                          }
                      }
                      return results;
                  }
              }
              // 在node下 查找selector 元素 （实现后代选择器功能使用）
              function basicSelect(selector, node) {
                  // node 初始值为document
                  node = node || document;
                  var m, res;
                  // 用正则匹配 并提取（分组捕获）
                  // 找到符合条件的 的后面的就不找了为undefined
                  m = rbaseselector.exec(selector);
                  if (m) {
                      // 这里为什么要加一个id判断条件？？
                      // 有 并且能获取res 保证返回值的类型与系统默认的类型相同（默认是空数组）
                      res = document.getElementById(m[1]);
                      if (m[1]) { //id
                          if (res) {
                              return res;
                          } else {
                              return [];
                          }
                      }
                      if (m[2]) { //class
                          return getClassName(m[2], node); //把搜索范围node继续给getClassName
                      } else if (m[3]) { //tagName 标签名
                          return node.getElementsByTagName(m[3]);
                      } else if (m[4]) { // * 通配符
                          return node.getElementsByTagName(m[4]);
                      }
                  }
                  return [];
              }
              // 后代选择器 的处理
              function select2(selector, results) {
                  results = results || [];
                  // 定义变量
                  var selectors, i, j,
                      arr = [],
                      node = [document];
                  // 用splice对selector分割  返回一个数组
                  //以空格为依据 对selector 进行分割
                  // 假如selector = 'div   p   .c ' 以空格为依据分割后
                  // selectors = ['div','p','.c']
                  selectors = selector.split(" ");
                  // 双循环 处理后代选择器的精髓所在
                  for (i = 0; i < selectors.length; i++) {
                      for (j = 0; j < node.length; j++) {
                          push.apply(arr, basicSelect(selectors[i], node[j]));
                      }
                      // 给node赋值 并清空arr
                      node = arr;
                      arr = [];
                  }
                  push.apply(results, node);
                  return results;
              }

              function select(selector, results) {
                  var selectors, subSelect, i, m;
                  results = results || [];
                  // 首先判断传入的参数是不是字符串
                  if (typeof selector != 'string') return results;

                  // 判断系统是否有 querySelectorAll 方法
                  if (support.qsa) {
                      push.apply(results, document.querySelectorAll(selector));
                  } else {
                      // 系统没有 querySelectorAll 方法 则继续向下执行
                      // 处理分割 用逗号连接 返回的是一个数组
                      selectors = selector.split(',');
                      // 遍历每个元素
                      for (i = 0; i < selectors.length; i++) {
                          // 去掉每个元素中的空格
                          subSelect = myTrim(selectors[i]);
                          // 处理subSelect 正则匹配
                          if (rbaseselector.test(subSelect)) { //返回值是 true或 false
                              // 基本选择器（比如 #xx .xx * 标签。）
                              push.apply(results, basicSelect(subSelect));
                          } else {
                              // 如果不是 那么就是后代选择器 调用select2 函数
                              select2(subSelect, results);
                          }
                      }
                  }
                  // 结果去重复
                  return unique(results);
              }
              // 将 select函数从沙箱中返回 出去
              return select;
          })();

      itcast.select = select;


      //DOM 操作的方法
      //将字符串转换为 DOM 对象的函数
      var parseHTML = (function() {
          // 首先创建一个容器
          var div = document.createElement('div');

          function parseHTML(html) {
              // 将字符串赋值给 div 的innerHTML 属性 
              div.innerHTML = html;
              var res = [],
                  i;
              for (var i = div.childNodes.length - 1; i >= 0; i--) {
                  res.push(div.childNodes[i]);
              }
              // 清空 div 中的内容
              div.innerHTML = '';
              // 返回所有元素的数组
              return res;
          }
          // 将 parseHTML 函数 从沙箱中返回出去
          return parseHTML;
      })();

      //添加可扩展的方法
      // 给itcast函数添加成员extend，给itcast原型对象添加成员extend
      // extend成员他是一个函数，功能：将参数obj 的成员添加给this对象
      // 谁调用extend方法，obj的成员就混入给谁
      // 参数obj 是一个对象 所以extend要传入一个对象
      itcast.extend = itcast.fn.extend = function(obj) {
              // 遍历extend中的对象
              for (var k in obj) {
                  // if ( k 是 obj 自己提供的方法 ) 用 obj.hasOwnProperty( k ) 来判断(其他地方可能有)
                  this[k] = obj[k];
              }
          }
          // 怎么来判断混入的 方法是加到itcast上，还是加到原型上面？
          // 是否要使用实例的数据
      itcast.extend({
          // isString 判断字符串
          isString: function(data) {
              return typeof data === 'string';
          },
          isFunction: function(data) {
              return typeof data === 'function';
          },
          isDom: function(data) {
              return !!data.nodeType;
          },
          prependChild: function(parent, element) {
              parent.insertBefore(element, parent.firstChild);
          },
          // 给 itcast构造函数添加 each map 的静态方法
          // 遍历
          each: function(arr, func) {
              var i;
              // 判断是不是数组 或者有length属性的维数组
              if (arr instanceof Array || arr.length >= 0) {
                  //遍历数组
                  for (i = 0; i < arr.length; i++) {
                      // 实现this指向为arr[i]
                      func.call(arr[i], i, arr[i]);
                  }
              } else {
                  // 遍历对象
                  for (i in arr) {
                      func.call(arr[i], i, arr[i]);
                  }
              }
              return arr;
          },
          // 映射
          map: function(arr, func) {
              var i, tmp, res = [];
              if (arr instanceof Array || arr.length >= 0) {
                  for (i = 0; i < arr.length; i++) {
                      tmp = func(arr[i], i);
                      if (tmp != null) {
                          res.push(tmp);
                      }
                  }
              } else {
                  for (i in arr) {
                      tmp = func(arr[i], i);
                      if (tmp != null) {
                          res.push(tmp);
                      }
                  }
              }
              return res;
          }
      });
      // 添加don元素操作模块
      itcast.fn.extend({
          // 添加 appendTo 方法： 把有语义的标签字符串追加到页面
          // 三种情况
          /*
             1 参数是itcast对象  var m = I('div'); I('<span>123</span>span>').appendTo( m )
             2 参数是dom 元素 .appendTo( document.body )
           */
          appendTo: function(sel) {
              var iObj = this.constructor(sel);
              // 遍历this中的元素
              var newObj = this.constructor(); //处理链式编程
              for (var i = 0; i < this.length; i++) {
                  // 遍历iObj中的元素
                  for (var j = 0; j < iObj.length; j++) {
                      var dom;
                      // 如果j循环是最后一次，就添加本体元素
                      if (j == iObj.length - 1) {
                          dom = this[i];
                      } else {
                          // 不是最后一次就克隆
                          dom = this[i].cloneNode(true);
                      }
                      push.call(newObj, dom);
                      // 将dom 添加到iObj对象的第j个元素中
                      iObj[j].appendChild(dom);
                  }
              }
              return newObj;
          },
          append: function(sel) {
              /* var iObj = this.constructor( sel );
               for( var i=0; i<iObj.length; i++ ){
                 for( var j=0; j<this.length; j++ ){
                   var dom;
                   if( i== iObj.length-1){
                     dom = iObj[i];
                   }else{
                     dom = iObj[i].cloneNode(true);
                   }
                   this[j].appendChild(dom);
                 }
               }*/
              this.constructor(sel).appendTo(this);
              return this;
          },
          prependTo: function(sel) {
              var newObj = this.constructor(); //处理链式编程
              var iObj = this.constructor(sel);
              for (var i = 0; i < this.length; i++) {
                  for (var j = 0; j < iObj.length; j++) {
                      var dom;
                      if (j == this.length - 1) {
                          dom = this[i];
                      } else {
                          dom = this[i].cloneNode(true);
                      }
                      push.call(newObj, dom);
                      this.constructor.prependChild(iObj[j], dom);
                  }
              }
              return newObj;
          },
          prepend: function(sel) {
              this.constructor(sel).prependTo(this);
              return this;
          }

      });
      // 添加核心方法功能模块
      itcast.fn.extend({
          // 将itcast对象中保存的元素转换为一个dom数组
          // 案例 var arr = I ('div').toArray();
          // arr中得到页面中所有div组成一个数组
          toArray: function() {
              // var res = [];
              // for (var i = 0; i < this.length; i++) {
              //     res.push(this[i]);
              // }
              // return res;
              // 相当于调用了数组的slice方法: arr.slice( 0 )
              return slice.call(this, 0);
          },
          // get 方法工具index 下标返回对应小标的元素
          // 如果没有传递下标，则返回所有元素组成的数组
          get: function(index) {
              // 不能写为 ！index 
              // 如果传入的是0，得不到第一个元素，而是返回这个数组
              // 所以要写 undefined
              if (index === undefined) {
                  // 返回这个元素数组
                  return this.toArray();
              }
              // 返回对应下标的元素
              return this[index];
          },
          // eq 方法：如果传入的参数的是数字，则根据序号返回对应的元素
          // 如果下标不对 那么返回一个空的itcast对象
          eq: function(num) {
              // 首先考虑先获得dom元素
              var dom;
              if (num >= 0) {
                  dom = this.get(num);
              } else {
                  // 如果传入的是负数
                  dom = this.get(this.length + num);
              }
              // 怎么让dom元素包装成itcast 对象？
              // 构造函数  constructor==》itcast
              // 为什么不直接写 itcast( dom );而是用this.constructor来访问itcast函数呢？
              // 跟语义化有关系，我们的代码是放在框架里面，如果说要访问itcast函数就应该使用 this.constructor
              // 对于使用框架的客户，对用户来说，如果要使用框架直接掉用itcast() 就可以了
              // 但是，在框架内部也使用itcast()就不合适了，这样就无法区分我到底在什么地方调用itcast()
              // 所以在外部我们使用itcast()调用框架，在内部使用this.constructor 来访问itcast函数

              return this.constructor(dom);

          },
          // 添加实例 each map 方法 this指向 dom 元素
          each: function(func) {
              // 将 this 中的每一个 DOM 元素遍历一下
              return itcast.each(this, func);
          },
          map: function(func) {
              return itcast.map(this, func);
          }
      });
      // 添加事件处理模块
      itcast.fn.extend({
          /*
          this到底是什么？
          this其实是一个指针，它指向了调用函数的对象
          所以，想知道this是什么，就要看this所在的函数是如何进行调用的
          第一种调用形式：函数调用模式 this就是window对象
          func();
          第二种调用形式： 方法调用模式，this就是指向调用方法的对象obj
          obj.func();
          第三种调用形式： 构造器调用模式, this就是构造出来的新的实例对象one
          var one = new func();
          第四种调用形式： 借调模式，this指向的就是apply或call方法的第一个参数
           如果第一个参数是null那么this是window
           函数调用模式
           方法调用模式
           */
          click: function(fn) {
              this.each(function()){ //this 指向当前itcast实例对象
                  //1. 这种直接赋值事件 是覆盖模式，不能实现事件的累加
                  // this.onclick = fn; //this指向 遍历的每一个dom元素
                  //2. 实现事件的追加
                  this.addEventListener('click', fn); //不兼容低版本IE
                  //3. attachEvent不能用，原因是 反过来执行事件

                  /*
                  自己实现事件的追加与移除功能
                  要实现事件追加与移除的功能要解决的问题
                  1>要找地方存储函数，使用数组
                  2>将来要使用 on,off 完成事件的添加与移除
                     即这个数组要求可以被两个方法访问
                      给每一个itcast对象添加一个events的属性
                      改属性存储每一个事件中可以有的事假处理函数
                      itcast实例对象.events = {
                          click: [f1, f2, f3]
                      }
                  3>如何触发事件
                      如果点击按钮，理论上会执行 onclick 中的函数，或addEventListener 或 
                   */


              }
              return this; //itcast实例对象
          }

      });

      window.itcast = window.I = itcast;

  })(window)
