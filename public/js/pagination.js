!function(a,e){function t(a){throw new Error("Pagination: "+a)}function i(a){a.dataSource||t('"dataSource" is required.'),"string"==typeof a.dataSource?void 0===a.totalNumberLocator?void 0===a.totalNumber?t('"totalNumber" is required.'):e.isNumeric(a.totalNumber)||t('"totalNumber" is incorrect. (Number)'):e.isFunction(a.totalNumberLocator)||t('"totalNumberLocator" should be a Function.'):l.isObject(a.dataSource)&&(void 0===a.locator?t('"dataSource" is an Object, please specify "locator".'):"string"==typeof a.locator||e.isFunction(a.locator)||t(a.locator+" is incorrect. (String | Function)")),void 0===a.formatResult||e.isFunction(a.formatResult)||t('"formatResult" should be a Function.')}function o(a){var t=["go","previous","next","disable","enable","refresh","show","hide","destroy"];e.each(t,function(e,t){a.off(s+t)}),a.data("pagination",{}),e(".paginationjs",a).remove()}function n(a,e){return("object"==(e=typeof a)?null==a&&"null"||Object.prototype.toString.call(a).slice(8,-1):e).toLowerCase()}void 0===e&&t("Pagination requires jQuery.");var r="pagination",s="__pagination-";e.fn.pagination&&(r="pagination2"),e.fn[r]=function(n){if(void 0===n)return this;var u=e(this),c=e.extend({},e.fn[r].defaults,n),g={initialize:function(){var a=this;if(u.data("pagination")||u.data("pagination",{}),!1!==a.callHook("beforeInit")){u.data("pagination").initialized&&e(".paginationjs",u).remove(),a.disabled=!!c.disabled;var t=a.model={pageRange:c.pageRange,pageSize:c.pageSize};a.parseDataSource(c.dataSource,function(e){if(a.isAsync=l.isString(e),l.isArray(e)&&(t.totalNumber=c.totalNumber=e.length),a.isDynamicTotalNumber=a.isAsync&&c.totalNumberLocator,!(c.hideWhenLessThanOnePage&&a.getTotalPage()<=1)){var i=a.render(!0);c.className&&i.addClass(c.className),t.el=i,u["bottom"===c.position?"append":"prepend"](i),a.observer(),u.data("pagination").initialized=!0,a.callHook("afterInit",i)}})}},render:function(a){var t=this,i=t.model,o=i.el||e('<div class="paginationjs"></div>'),n=!0!==a;t.callHook("beforeRender",n);var r=i.pageNumber||c.pageNumber,s=c.pageRange,l=t.getTotalPage(),u=r-s,g=r+s;return g>l&&(g=l,u=l-2*s,u=u<1?1:u),u<=1&&(u=1,g=Math.min(2*s+1,l)),o.html(t.generateHTML({currentPage:r,pageRange:s,rangeStart:u,rangeEnd:g})),t.callHook("afterRender",n),o},generateHTML:function(a){var t,i,o=this,n=a.currentPage,r=o.getTotalPage(),s=a.rangeStart,l=a.rangeEnd,u=o.getTotalNumber(),g=c.showPrevious,p=c.showNext,d=c.showPageNumbers,f=c.showNavigator,m=c.showGoInput,b=c.showGoButton,h=c.pageLink,v=c.prevText,N=c.nextText,y=c.ellipsisText,k=c.goButtonText,P=c.classPrefix,x=c.activeClassName,j=c.disableClassName,S=c.ulClassName,w="",T='<input type="text" class="J-paginationjs-go-pagenumber">',H='<input type="button" class="J-paginationjs-go-button" value="'+k+'">',F=e.isFunction(c.formatNavigator)?c.formatNavigator(n,r,u):c.formatNavigator,C=e.isFunction(c.formatGoInput)?c.formatGoInput(T,n,r,u):c.formatGoInput,O=e.isFunction(c.formatGoButton)?c.formatGoButton(H,n,r,u):c.formatGoButton,L=e.isFunction(c.autoHidePrevious)?c.autoHidePrevious():c.autoHidePrevious,D=e.isFunction(c.autoHideNext)?c.autoHideNext():c.autoHideNext,J=e.isFunction(c.header)?c.header(n,r,u):c.header,A=e.isFunction(c.footer)?c.footer(n,r,u):c.footer;if(J&&(t=o.replaceVariables(J,{currentPage:n,totalPage:r,totalNumber:u}),w+=t),g||d||p){if(w+='<div class="paginationjs-pages">',w+=S?'<ul class="'+S+'">':"<ul>",g&&(n<=1?L||(w+='<li class="'+P+"-prev "+j+'"><a>'+v+"</a></li>"):w+='<li class="'+P+'-prev J-paginationjs-previous" data-num="'+(n-1)+'" title="Previous page"><a href="'+h+'">'+v+"</a></li>"),d){if(s<=3)for(i=1;i<s;i++)w+=i==n?'<li class="'+P+"-page J-paginationjs-page "+x+'" data-num="'+i+'"><a>'+i+"</a></li>":'<li class="'+P+'-page J-paginationjs-page" data-num="'+i+'"><a href="'+h+'">'+i+"</a></li>";else c.showFirstOnEllipsisShow&&(w+='<li class="'+P+"-page "+P+'-first J-paginationjs-page" data-num="1"><a href="'+h+'">1</a></li>'),w+='<li class="'+P+"-ellipsis "+j+'"><a>'+y+"</a></li>";for(i=s;i<=l;i++)w+=i==n?'<li class="'+P+"-page J-paginationjs-page "+x+'" data-num="'+i+'"><a>'+i+"</a></li>":'<li class="'+P+'-page J-paginationjs-page" data-num="'+i+'"><a href="'+h+'">'+i+"</a></li>";if(l>=r-2)for(i=l+1;i<=r;i++)w+='<li class="'+P+'-page J-paginationjs-page" data-num="'+i+'"><a href="'+h+'">'+i+"</a></li>";else w+='<li class="'+P+"-ellipsis "+j+'"><a>'+y+"</a></li>",c.showLastOnEllipsisShow&&(w+='<li class="'+P+"-page "+P+'-last J-paginationjs-page" data-num="'+r+'"><a href="'+h+'">'+r+"</a></li>")}p&&(n>=r?D||(w+='<li class="'+P+"-next "+j+'"><a>'+N+"</a></li>"):w+='<li class="'+P+'-next J-paginationjs-next" data-num="'+(n+1)+'" title="Next page"><a href="'+h+'">'+N+"</a></li>"),w+="</ul></div>"}return f&&F&&(t=o.replaceVariables(F,{currentPage:n,totalPage:r,totalNumber:u}),w+='<div class="'+P+'-nav J-paginationjs-nav">'+t+"</div>"),m&&C&&(t=o.replaceVariables(C,{currentPage:n,totalPage:r,totalNumber:u,input:T}),w+='<div class="'+P+'-go-input">'+t+"</div>"),b&&O&&(t=o.replaceVariables(O,{currentPage:n,totalPage:r,totalNumber:u,button:H}),w+='<div class="'+P+'-go-button">'+t+"</div>"),A&&(t=o.replaceVariables(A,{currentPage:n,totalPage:r,totalNumber:u}),w+=t),w},findTotalNumberFromRemoteResponse:function(a){this.model.totalNumber=c.totalNumberLocator(a)},go:function(a,t){function i(a){if(!1===o.callHook("beforePaging",r))return!1;if(n.direction=void 0===n.pageNumber?0:r>n.pageNumber?1:-1,n.pageNumber=r,o.render(),o.disabled&&o.isAsync&&o.enable(),u.data("pagination").model=n,c.formatResult){var i=e.extend(!0,[],a);l.isArray(a=c.formatResult(i))||(a=i)}u.data("pagination").currentPageData=a,o.doCallback(a,t),o.callHook("afterPaging",r),1==r&&o.callHook("afterIsFirstPage"),r==o.getTotalPage()&&o.callHook("afterIsLastPage")}var o=this,n=o.model;if(!o.disabled){var r=a;if((r=parseInt(r))&&!(r<1)){var s=c.pageSize,g=o.getTotalNumber(),p=o.getTotalPage();if(!(g>0&&r>p)){if(!o.isAsync)return void i(o.getDataFragment(r));var d={},f=c.alias||{};d[f.pageSize?f.pageSize:"pageSize"]=s,d[f.pageNumber?f.pageNumber:"pageNumber"]=r;var m=e.isFunction(c.ajax)?c.ajax():c.ajax,b={type:"get",cache:!1,data:{},contentType:"application/x-www-form-urlencoded; charset=UTF-8",dataType:"json",async:!0};e.extend(!0,b,m),e.extend(b.data,d),b.url=c.dataSource,b.success=function(a){o.isDynamicTotalNumber?o.findTotalNumberFromRemoteResponse(a):o.model.totalNumber=c.totalNumber,i(o.filterDataByLocator(a))},b.error=function(a,e,t){c.formatAjaxError&&c.formatAjaxError(a,e,t),o.enable()},o.disable(),e.ajax(b)}}}},doCallback:function(a,t){var i=this.model;e.isFunction(t)?t(a,i):e.isFunction(c.callback)&&c.callback(a,i)},destroy:function(){!1!==this.callHook("beforeDestroy")&&(this.model.el.remove(),u.off(),e("#paginationjs-style").remove(),this.callHook("afterDestroy"))},previous:function(a){this.go(this.model.pageNumber-1,a)},next:function(a){this.go(this.model.pageNumber+1,a)},disable:function(){var a=this,e=a.isAsync?"async":"sync";!1!==a.callHook("beforeDisable",e)&&(a.disabled=!0,a.model.disabled=!0,a.callHook("afterDisable",e))},enable:function(){var a=this,e=a.isAsync?"async":"sync";!1!==a.callHook("beforeEnable",e)&&(a.disabled=!1,a.model.disabled=!1,a.callHook("afterEnable",e))},refresh:function(a){this.go(this.model.pageNumber,a)},show:function(){var a=this;a.model.el.is(":visible")||a.model.el.show()},hide:function(){var a=this;a.model.el.is(":visible")&&a.model.el.hide()},replaceVariables:function(a,e){var t;for(var i in e){var o=e[i],n=new RegExp("<%=\\s*"+i+"\\s*%>","img");t=(t||a).replace(n,o)}return t},getDataFragment:function(a){var e=c.pageSize,t=c.dataSource,i=this.getTotalNumber(),o=e*(a-1)+1,n=Math.min(a*e,i);return t.slice(o-1,n)},getTotalNumber:function(){return this.model.totalNumber||c.totalNumber||0},getTotalPage:function(){return Math.ceil(this.getTotalNumber()/c.pageSize)},getLocator:function(a){var i;return"string"==typeof a?i=a:e.isFunction(a)?i=a():t('"locator" is incorrect. (String | Function)'),i},filterDataByLocator:function(a){var i,o=this.getLocator(c.locator);if(l.isObject(a)){try{e.each(o.split("."),function(e,t){i=(i||a)[t]})}catch(a){}i?l.isArray(i)||t("dataSource."+o+" must be an Array."):t("dataSource."+o+" is undefined.")}return i||a},parseDataSource:function(a,i){var o=this;l.isObject(a)?i(c.dataSource=o.filterDataByLocator(a)):l.isArray(a)?i(c.dataSource=a):e.isFunction(a)?c.dataSource(function(a){l.isArray(a)||t('The parameter of "done" Function should be an Array.'),o.parseDataSource.call(o,a,i)}):"string"==typeof a?(/^https?|file:/.test(a)&&(c.ajaxDataType="jsonp"),i(a)):t('Unexpected type of "dataSource".')},callHook:function(t){var i,o=u.data("pagination"),n=Array.prototype.slice.apply(arguments);return n.shift(),c[t]&&e.isFunction(c[t])&&!1===c[t].apply(a,n)&&(i=!1),o.hooks&&o.hooks[t]&&e.each(o.hooks[t],function(e,t){!1===t.apply(a,n)&&(i=!1)}),!1!==i},observer:function(){var a=this,i=a.model.el;u.on(s+"go",function(i,o,n){(o=parseInt(e.trim(o)))&&(e.isNumeric(o)||t('"pageNumber" is incorrect. (Number)'),a.go(o,n))}),i.delegate(".J-paginationjs-page","click",function(t){var i=e(t.currentTarget),o=e.trim(i.attr("data-num"));if(o&&!i.hasClass(c.disableClassName)&&!i.hasClass(c.activeClassName))return!1!==a.callHook("beforePageOnClick",t,o)&&(a.go(o),a.callHook("afterPageOnClick",t,o),!!c.pageLink&&void 0)}),i.delegate(".J-paginationjs-previous","click",function(t){var i=e(t.currentTarget),o=e.trim(i.attr("data-num"));if(o&&!i.hasClass(c.disableClassName))return!1!==a.callHook("beforePreviousOnClick",t,o)&&(a.go(o),a.callHook("afterPreviousOnClick",t,o),!!c.pageLink&&void 0)}),i.delegate(".J-paginationjs-next","click",function(t){var i=e(t.currentTarget),o=e.trim(i.attr("data-num"));if(o&&!i.hasClass(c.disableClassName))return!1!==a.callHook("beforeNextOnClick",t,o)&&(a.go(o),a.callHook("afterNextOnClick",t,o),!!c.pageLink&&void 0)}),i.delegate(".J-paginationjs-go-button","click",function(t){var o=e(".J-paginationjs-go-pagenumber",i).val();if(!1===a.callHook("beforeGoButtonOnClick",t,o))return!1;u.trigger(s+"go",o),a.callHook("afterGoButtonOnClick",t,o)}),i.delegate(".J-paginationjs-go-pagenumber","keyup",function(t){if(13===t.which){var o=e(t.currentTarget).val();if(!1===a.callHook("beforeGoInputOnEnter",t,o))return!1;u.trigger(s+"go",o),e(".J-paginationjs-go-pagenumber",i).focus(),a.callHook("afterGoInputOnEnter",t,o)}}),u.on(s+"previous",function(e,t){a.previous(t)}),u.on(s+"next",function(e,t){a.next(t)}),u.on(s+"disable",function(){a.disable()}),u.on(s+"enable",function(){a.enable()}),u.on(s+"refresh",function(e,t){a.refresh(t)}),u.on(s+"show",function(){a.show()}),u.on(s+"hide",function(){a.hide()}),u.on(s+"destroy",function(){a.destroy()});var o=Math.max(a.getTotalPage(),1),n=c.pageNumber;a.isDynamicTotalNumber&&(n=1),c.triggerPagingOnInit&&u.trigger(s+"go",Math.min(n,o))}};if(u.data("pagination")&&!0===u.data("pagination").initialized){if(e.isNumeric(n))return u.trigger.call(this,s+"go",n,arguments[1]),this;if("string"==typeof n){var p=Array.prototype.slice.apply(arguments);switch(p[0]=s+p[0],n){case"previous":case"next":case"go":case"disable":case"enable":case"refresh":case"show":case"hide":case"destroy":u.trigger.apply(this,p);break;case"getSelectedPageNum":return u.data("pagination").model?u.data("pagination").model.pageNumber:u.data("pagination").attributes.pageNumber;case"getTotalPage":return Math.ceil(u.data("pagination").model.totalNumber/u.data("pagination").model.pageSize);case"getSelectedPageData":return u.data("pagination").currentPageData;case"isDisabled":return!0===u.data("pagination").model.disabled;default:t("Unknown action: "+n)}return this}o(u)}else l.isObject(n)||t("Illegal options");return i(c),g.initialize(),this},e.fn[r].defaults={totalNumber:0,pageNumber:1,pageSize:10,pageRange:2,showPrevious:!0,showNext:!0,showPageNumbers:!0,showNavigator:!1,showGoInput:!1,showGoButton:!1,pageLink:"",prevText:"&laquo;",nextText:"&raquo;",ellipsisText:"...",goButtonText:"Go",classPrefix:"paginationjs",activeClassName:"active",disableClassName:"disabled",inlineStyle:!0,formatNavigator:"<%= currentPage %> / <%= totalPage %>",formatGoInput:"<%= input %>",formatGoButton:"<%= button %>",position:"bottom",autoHidePrevious:!1,autoHideNext:!1,triggerPagingOnInit:!0,hideWhenLessThanOnePage:!1,showFirstOnEllipsisShow:!0,showLastOnEllipsisShow:!0,callback:function(){}},e.fn.addHook=function(a,i){arguments.length<2&&t("Missing argument."),e.isFunction(i)||t("callback must be a function.");var o=e(this),n=o.data("pagination");n||(o.data("pagination",{}),n=o.data("pagination")),!n.hooks&&(n.hooks={}),n.hooks[a]=n.hooks[a]||[],n.hooks[a].push(i)},e[r]=function(a,i){arguments.length<2&&t("Requires two parameters.");var o;if((o="string"!=typeof a&&a instanceof jQuery?a:e(a)).length)return o.pagination(i),o};var l={};e.each(["Object","Array","String"],function(a,e){l["is"+e]=function(a){return n(a)===e.toLowerCase()}}),"function"==typeof define&&define.amd&&define(function(){return e})}(this,window.jQuery);