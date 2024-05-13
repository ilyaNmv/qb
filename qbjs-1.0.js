let iii = 0;
const qb = (function(){
	
	// глобальный элемент
	let GLOBAL = {
		run(){
			return initNewQb(...arguments); // инициализация прокси объекта
		},

		$(data){
			let link = qb.lastGetter();
			if( qb.links.hasOwnProperty(link.fantom[link.prop].__qb_link_))
				return qb.links[link.fantom[link.prop].__qb_link_];

			let result = {
				__qb_proxy_linkObj_: link.target,
				__qb_proxy_linkProxy_: link.proxy, 
				__qb_proxy_linkVar_: [],
				__qb_proxy_linkProp_: link.prop,
				__qb_proxy_linkFantom_: link.fantom[link.prop],
				__qb_link_: link.fantom[link.prop].__qb_link_,
				_proxy: true,
				_val: true,
				_setter: undefined,
				_setterGetRun(){
					let link = this.__qb_link_;
					let arrLink = link.split('.');
					let obj = GLOBAL.targets[arrLink[0]].target;
					let fantom = GLOBAL.targets[arrLink[0]].fantom;
					
					let objArr = [];
					let fantomArr = [];
					arrLink.shift();
					
					arrLink.forEach((key)=>{
						objArr.push({target: undefined, parent: obj, prop: key, targetCall: undefined, targetLink: undefined});
						obj = obj[key];
						fantom = fantom[key];
						fantomArr.push(fantom);
						if(fantom.__qb_runGlues_)
							fantom.__qb_runGlues_(obj);
					})

					arrLink.reverse();
					fantomArr.reverse();
					objArr.reverse();
					
					let targetSetter;
					arrLink.forEach((key,i)=>{
						if(i == 0){
							targetSetter = objArr[i];
							targetSetter.targetLink = [...arrLink].reverse();
							Object.defineProperty(targetSetter, "target", {
								get() {
									return this.parent[this.prop];
								},
								set(set) {
									this.parent[this.prop] = set;
								}
							});
						}

						fantomArr[i].__qb_glues_.forEach(function(el){
							targetSetter.targetCall = objArr[i].parent[objArr[i].prop];

							if(el.type == "setter") el.cb(targetSetter);
						})
					})
				},
				toString(){
					//return this.__qb_proxy_linkObj_[this.__qb_proxy_linkProp_];
					return `@_${this.__qb_link_}_@`;
				},
				valueOf(){
					// if(typeof this.__qb_proxy_linkObj_[this.__qb_proxy_linkProp_]=='string')
					// 	return {};	
					// else
					// 	return this.__qb_proxy_linkObj_[this.__qb_proxy_linkProp_];	
					return {};
				},
				value(){
					return this.__qb_proxy_linkObj_[this.__qb_proxy_linkProp_];
				}
			};

			Object.defineProperty(result, "_setter", {
				get() {
					return this.__qb_proxy_linkFantom_.__qb_glues_;
				},
				set(cb) {
					this.__qb_proxy_linkProxy_[this.__qb_proxy_linkProp_];
					// let cbIsTrue = this.__qb_proxy_linkFantom_.__qb_glues_.filter(x => x.name === cb.name.replace(/[^ ]+ /, ''));
					// if(cbIsTrue.length < 1)
						this.__qb_proxy_linkFantom_.__qb_glues_.push({type: 'setter', cb: cb, name: cb.name.replace(/[^ ]+ /, '')})
					// else{
					// 	console.log(cbIsTrue)
					// 	cbIsTrue[0] = {type: 'setter', cb: cb, name: cb.name.replace(/[^ ]+ /, '')};
					// }
				}
			});

			Object.defineProperty(result, "_val", {
				get() {
					return this.value();
				},
				set(data) {
					console.log(data)
					this.__qb_proxy_linkProxy_[this.__qb_proxy_linkProp_] = data;
				}
			});

			qb.links[link.fantom[link.prop].__qb_link_] = result;
			return result;
		},


		$str(str){
			if([...arguments].length > 1)
				str = [...arguments].join('');
			

			let value = str;
			let re = /\@_(.*?)\_@/g;
			let valueLinks = value.match(re);
			let valueObj = [];

			valueLinks.forEach(function(objStr) {
				let result = '';
				let key = objStr;
				objStr = objStr.substring(2).slice(0, -2).split('.');

				let target = qb.targets[objStr[0]].target;
				let fantom = qb.targets[objStr[0]].fantom;
				let set = qb.targets[objStr[0]].set;
				let proxy = qb.targets[objStr[0]].proxy;
				let prop;

				objStr.shift();

				objStr.forEach(function(key, id){
					if(id == objStr.length-1) return prop = key;
					target = target[key];
					fantom = fantom[key];
					proxy = proxy[key]
				})

				valueObj.push({
					target: target,
					fantom: fantom,
					set: set,
					proxy: proxy,
					value: target[prop],
					key: key,
					prop: prop,
					link: qb.$(proxy)
				})
			})

			valueObj.forEach(function(data){
				value = value.replace(data.key, data.value)
			})


			let mathlet = qb.run({
				data: {
					//math: eval(value), //qb.strToMath(value)
					value: value,
					str: str
				}
			})


			valueObj.forEach(function(data){
				data.link._setter = function() {
					let value = mathlet.str;
					
					valueObj.forEach(function(data){
						value = value.replace(data.key, data.proxy[data.prop])
					})
					mathlet.value = value;
				}
			})

			return mathlet.value_$;
	},


		$math(str){
			if([...arguments].length > 1)
				str = [...arguments].join('');
			

			let value = str;
			let re = /\@_(.*?)\_@/g;
			let valueLinks = value.match(re);
			let valueObj = [];

			valueLinks.forEach(function(objStr) {
				let result = '';
				let key = objStr;
				objStr = objStr.substring(2).slice(0, -2).split('.');

				let target = qb.targets[objStr[0]].target;
				let fantom = qb.targets[objStr[0]].fantom;
				let set = qb.targets[objStr[0]].set;
				let proxy = qb.targets[objStr[0]].proxy;
				let prop;

				objStr.shift();

				objStr.forEach(function(key, id){
					if(id == objStr.length-1) return prop = key;
					target = target[key];
					fantom = fantom[key];
					proxy = proxy[key]
				})

				valueObj.push({
					target: target,
					fantom: fantom,
					set: set,
					proxy: proxy,
					value: target[prop],
					key: key,
					prop: prop,
					link: qb.$(proxy)
				})
			})

			valueObj.forEach(function(data){
				value = value.replace(data.key, data.value)
			})

			let mathlet = qb.run({
				data: {
					math: eval(value), //qb.strToMath(value)
					value: value,
					str: str
				}
			})

			


			valueObj.forEach(function(data){
				data.link._setter = function() {
					let value = mathlet.str;
					
					valueObj.forEach(function(data){
						value = value.replace(data.key, data.proxy[data.prop])
					})

					mathlet.value = value;
					mathlet.math = qb.strToMath(value);
				}
			})

			return mathlet.math_$;
	},

		
		strToMath(string) {
			string = string.replaceAll(' ', '').replaceAll('+', ' + ').replaceAll('*', ' * ').replaceAll('-', ' - ').replaceAll('/', ' / ').split(' ');
			
			for(let i = 0; i < string.length; i++){
				if(string[i] == ''){
					string.splice(i, 2);
					string[i] = '-'+string[i];
				}
			}

			let calc = document.createElement('calc');
			calc.style['opacity'] = `calc(${string.join(' ')})`;
			let result = parseFloat(calc.style['opacity'].replace('calc(', '').replace(')', ''))
			calc.remove();

			return result;
		},

		lastGetter(getter, proxy, fantom, set){ // последний getter в прокси объекте
			if(arguments.length){
				this.lastGetter.getter = {target: getter.target, prop: getter.prop, proxy: proxy, fantom: fantom, set: set, methods: this.methods};
				set.lastGetter = {...this.lastGetter.getter};
			}
			else 
				return {...this.lastGetter.getter};
		},

		targets: [],
		links: {},

		targetsGet(data){
			if(!data) return [];
			data = typeof data == 'object' ? data : [data];
			
			let result = [];

			data.forEach(function(link) {
				let tegLink = link;
				let strLink = link.replace('@_', '').replace('_@', '');
				let arrLink = strLink.split('.');
				let prop = '';
				let target = qb.targets[arrLink[0]].target;
				let fantom = qb.targets[arrLink[0]].fantom;
				let set = qb.targets[arrLink[0]].set;
				
				arrLink.shift();

				for(let i = 0; i < arrLink.length; i++){
					if(i == arrLink.length-1){
						prop = arrLink[i];
						break;
					}
					target = target[arrLink[i]];
					fantom = fantom[arrLink[i]];
				}
				result.push({
					key: strLink,
					prop: prop,
					teg: tegLink,
					target: target,
					fantom: fantom[prop],
					set: set,
					value: target[prop]
				})
			})

			return result;
		},
		addSetDom: {
			appendText: {prop: 'innerText', cb(domEl,add,prop){ domEl[prop] = domEl[prop]+add}},
			prependText: {prop: 'innerText', cb(domEl,prep,prop){ domEl[prop] = prep+domEl[prop]}},
			appendHTML: {prop: 'innerHTML', cb(domEl,add,prop){ domEl[prop] = domEl[prop]+add}},
			prependHTML: {prop: 'innerHTML', cb(domEl,prep,prop){ domEl[prop] = prep+domEl[prop]}},
		},

		domSetColection: {
			'value': 'input', 
			'valueAsNumber': 'input', 
			'checked': 'change',
		},

		domPostRenderArr: [],
		
		domPostRenderActive: true,
		
		domRenderPostArr: {},
		
		domRenderPostAdd(cb){
			this.domRenderPostArr[cb.name] = cb;
			cb()
			//this.domPostRender();
		},

		domPostRender(){
			//qb.domPostRenderArr.forEach(function(colection) {
				qb.domRender(qb.domPostRenderArr)
			//})
			qb.domPostRenderArr = [];
		},


		// Функции коректоры числовых значений в полях для ввода
		numCorrectionFuns: {
			funs: [
				function commaInDot(e,dom,set){
					dom.value = dom.value.replaceAll(',', '.');
				},

				function noZeroFirst(e,dom,set){
					if(dom.value[0] == '0' && dom.value[1] == '-'){
						dom.value = dom.value.replace('0','');
					}
					if(dom.value[0] == '0' && dom.value[1] != '.')
						dom.value = Number(dom.value);
				},

				function noMinus(e,dom,set = ['']) {
					if(dom.value[0] == '-')	
						dom.value = dom.value.replace('-','')
				},

				function noEmpty(e,dom,set = [0]) {
					if(dom.value == '')	
						dom.value = set[0];
				},

				function noNaN(e,dom,set = ['']){
					if(dom.value[0] == '.')
						dom.value = 0 + dom.value;
					if(isNaN(Number(dom.value)) && !(dom.value.length == 1 && dom.value[0] == '-')){
						dom.value = set[0];
					}
				},
			],
			
			getFun(name){
				return this.funs.find(fun => fun.name === name);
			},

			addStart(newFun){
				this.funs.unshift(newFun)
			},

			addEnd(newFun){
				this.funs.push(newFun)
			},

			addAfter(name, newFun){
				let index = this.funs.findIndex((fun) => fun.name == name);
				this.funs.splice(index, 0, newFun)
			},

			addBefore(name, newFun){
				let index = this.funs.findIndex((fun) => fun.name == name) - 1;
				if(index < 0)
					this.funs.unshift(newFun)
				else
					this.funs.splice(index, 0, newFun)
			},

			delFun(name){
				let index = this.funs.findIndex((fun) => fun.name == name);
				this.funs.splice(index, 1);
			},

			splitParametrs(str) {
				str = str.replace(/\s*\(\s*/g, "(");
				const arr = [];
				const regex = /(\w+)\((.*?)\)|(\w+)(?=\s|$)/g;
				let match;

				while ((match = regex.exec(str))) {
					const name = match[1] || match[3];
					const setMatch = match[2];

					if (setMatch) {
						const set = setMatch.split(',').map((item) => {
							if (!isNaN(item.trim())) {
								return Number(item.trim());
							} else if (item.trim() == 'false' || item.trim() == 'true') {
								return item.trim() == 'true';
							} else {
								return item.trim().replace(/'/g, "");
							}
						});

						arr.push({
							name: name,
							set: set
						});
					} else if (name) {
						arr.push({
							name: name
						});
					}
				}

				return arr;
			}
		},

		// функция для запуска корректоров
		domCorrectionRender(e,dom){
			let arrCorrectionName = dom.getAttribute('qb-num-correction') ? qb.numCorrectionFuns.splitParametrs(dom.getAttribute('qb-num-correction')) : [];
			let arrCorrectionOffName = dom.getAttribute('qb-num-correction-off') ? qb.numCorrectionFuns.splitParametrs(dom.getAttribute('qb-num-correction-off')) : [];
			
			for(inTurn of qb.numCorrectionFuns.funs){
				let i = arrCorrectionName.findIndex((obj) => obj.name == inTurn.name);
				let ioff = arrCorrectionOffName.findIndex((obj) => obj.name == inTurn.name);
				if( i != -1 || inTurn.name.slice(0, 3) == 'on_')
					if(ioff == -1){
						inTurn(e,dom,arrCorrectionName?.[i]?.set);
					}
			}
		},

		domRender(colection){
			colection.forEach(function(dom,id) {
				if(!dom._qb_render) return;
				if(qb.domSetListIgnore == dom) return qb.domSetListIgnore = false;

				let objKeys = Object.keys(dom._qb_render)

				for(let i = 0; i < objKeys.length; i++){
					let prop = objKeys[i];
					let objRender = dom._qb_render[prop];

					// if(objRender.renderValue != dom._qb_render[objKey].renderValue)
					if(prop == 'style'){
						Object.keys(objRender.renderValue).forEach(function(styleKey) {
							dom.style[styleKey] = objRender.renderValue[styleKey]._proxy ? objRender.renderValue[styleKey]._val : objRender.renderValue[styleKey];
						})
					}
					else if(prop == 'attributes'){
						Object.keys(objRender.renderValue).forEach(function(attributesType) {
							let attributesArr = typeof objRender.renderValue[attributesType] == 'object' ? objRender.renderValue[attributesType] : [objRender.renderValue[attributesType]];
							
							let attributesStr = attributesArr.join(' ')

							if(!dom.attributes[attributesType])
								dom.setAttribute(attributesType,'');
							console.log(objRender)

							dom.attributes[attributesType].value = dom.getAttribute(attributesType) + ' ' + objRender.renderValue[attributesType];
						})
					}
					// else if(typeof objRender.renderValue == 'object'){
					// 	Object.keys(objRender.renderValue).forEach(function(key,idKey) {
					// 		console.error(objRender)
					// 		if(id == idKey) dom[prop] = objRender.renderValue[key];
					// 	})
					// }
					else
						dom[prop] = objRender.renderValue;
							
				}
			})
		},

		checkDomRender(colection){
			colection.forEach(function(dom) {
				if(!dom._qb_render) return;

				let objKeys = Object.keys(dom._qb_render)

				for(let i = 0; i < objKeys.length; i++){
					let prop = objKeys[i];
					let objRender = dom._qb_render[prop];
					let value = objRender.value;
					let re = /\@_(.*?)\_@/g;
					let valueLinks = qb.targetsGet(new String(value).toString().match(re));
					let valueVars = [];
					let inval = value;
					
					for(let ii = 0; ii < valueLinks.length; ii++){
						
						valueVars.push({
							obj: valueLinks[ii].target,
							prop: valueLinks[ii].prop,
							value: valueLinks[ii].value
						})

						if(typeof valueLinks[ii].value == 'object')
							inval = valueLinks[ii].value;
						else
							inval = inval.replaceAll(valueLinks[ii].teg, valueLinks[ii].value)

						if(valueLinks[ii].fantom.__qb_glues_.indexOf( dom ) == -1){
							valueLinks[ii].fantom.__qb_glues_.push(dom)
						}
						if(!valueLinks[ii].fantom.__qb_runGlues_){
							valueLinks[ii].fantom.__qb_runGlues_ = qb.checkDomRender.bind(qb,valueLinks[ii].fantom.__qb_glues_); ////// _setter попадает в массив дом через glues
						}
					}

					if(typeof dom[prop] == 'number')
						inval = Number(inval);
					if(typeof dom[prop] == 'boolean'){

						if(inval == '0' || inval == 'false') 
							inval = false;
						else if(inval == 'true')
							inval = true;
						else 
							inval = Boolean(inval);
					}

					objRender.renderValue = inval;
					objRender.vars = valueVars;
				}
			})

			if(qb.domPostRenderActive)
				qb.domRender(colection);
			else{
				colection.forEach(function(el) {
					if(!qb.domPostRenderArr.includes(el, 0))
						qb.domPostRenderArr.push(el);
				})
			}
		},

		domSetListIgnore: false,

		domSet(target, prop, value, setFantom, set, proxy){
			let customProp = {numValue: 'value'}
			// Присвоение массиву дом массива данных
			if((prop != '_style' && prop != '_attributes') && typeof value == 'object'){
				if(typeof value.value() == 'object'){
					Object.keys(value.value()).forEach(function(key, id){
						target.__qb_domEl_.__qb_dom_.colection.forEach(function(dom, idDom) {
							if(id == idDom) qb.methods._goFormatDom(dom)[prop] = value.value()[key + '_$'];
						})
					})
					
					return false;
				}
			}

			prop = prop[0] == '_' ? prop.substring(1) : prop;
			let customPropSet;
			if(customProp[prop]){
				customPropSet = prop;
				prop = customProp[prop];
			}

			let colection = target.__qb_domEl_.__qb_dom_.colection;

			let type = 'string';
			if(typeof value == 'object') type = 'object';
			if(prop == 'style') type = 'style';
			if(prop == 'attributes') type = 'attributes';
			console.log(type)
			colection.forEach(function(dom) {

				let renderSet = {runRender: true}
				if(type == 'string') {
					renderSet.type = typeof value;
					renderSet.value = value;
				}
				if(type == 'object'){
					renderSet.value = value.toString();
					renderSet.type = typeof value.value();
				}
				if(type == 'style') {
					renderSet.value = value.value ? value.toString() : value;
					renderSet.type = 'style';
				}
				if(type == 'attributes') {
					renderSet.value = value.value ? value.toString() : value;
					renderSet.type = 'attributes';
				}
				
				if(customPropSet) renderSet.customProp = (data)=>{return Number(data)};
				
				if(dom._qb_render)
					dom._qb_render[prop] = renderSet;
				else
					dom._qb_render = {[prop]: renderSet};
			})
			console.log(colection[0])
			qb.checkDomRender(colection);

			colection.forEach(function(dom) {
				dom._qb_render[prop].delete = qb.domDel.bind(dom, target, prop, value, setFantom, set);
				dom._qb_render[prop].stop = qb.domStop.bind(dom, target, prop, value, setFantom, set);
				dom._qb_render[prop].run = qb.domRun.bind(dom, target, prop, value, setFantom, set);
				if(!dom._qb_render.cbArrs) dom._qb_render.cbArrs = {[prop]: []};
				if(!dom._qb_render.cbArrs[prop]) dom._qb_render.cbArrs[prop] = [];
				dom._qb_render[prop].cb = function(e) {
					for (var i = 0; i < dom._qb_render.cbArrs[prop].length; i++) {
						if(typeof dom._qb_render.cbArrs[prop][i] == 'object')
							dom._qb_render.cbArrs[prop][i].forEach(function(cb){cb(e)});
						else	
							dom._qb_render.cbArrs[prop][i](e);
					}
				};
				
				if(qb.domSetColection.hasOwnProperty(prop) && dom._qb_render[prop].vars.length == 1){
					dom._qb_render[prop].initiator = false;
					qb.methods._goFormatDom(dom)._event(qb.domSetColection[prop], function(e) {

						let dom = this._dom(0);
						qb.domSetListIgnore = this._dom(0);
						
						qb.domCorrectionRender(e,dom)
						let result = dom[prop];
						
						if(dom._qb_render[prop].type == 'number' && dom._qb_render[prop].customProp)
							result = dom._qb_render[prop].customProp(result);
						
						function corectorType(dataCheck, value){
							if(dataCheck.constructor.name == 'Boolean'){
								return value == 'false' ? false : Boolean(value);
							}else if(dataCheck.constructor.name == 'Number'){
								return value.length == 1 && value[0] == '-' ? 0 : dataCheck.constructor(value);
							}else{
								return dataCheck.constructor(value)
							}
						}

						//dom._qb_render[prop].vars[0].obj[dom._qb_render[prop].vars[0].prop] = result;
						dom._qb_render[prop].vars[0].obj[dom._qb_render[prop].vars[0].prop] = corectorType(dom._qb_render[prop].vars[0].obj[dom._qb_render[prop].vars[0].prop] ,result)
						dom._qb_render[prop].cb(e);
						dom._qb_render[prop].initiator = true;
					})

					// dom['on'+qb.domSetColection[prop]] = function(e){
					// 	let result = this[prop];
					// 	this._qb_render[prop].vars[0].obj[this._qb_render[prop].vars[0].prop] = result;
					// 	console.log()
					// 	this._qb_render[prop].cb(e);
					// 	this._qb_render[prop].initiator = true;
					// };
				}
			})


		},

		domGet(target, prop, value, setFantom, set){
			let link = prop.slice(-2) == "_$";
			prop = prop[0] == '_' ? prop.substring(1).replace('_$', "") : prop.replace('_$', "");
			let arrResult = [];
			let colection = target.__qb_domEl_.__qb_dom_.colection;

			colection.forEach(function(dom) {
				arrResult.push(dom[prop]);
				if(dom._qb_render?.[prop] && link){
					arrResult[arrResult.length-1] = dom._qb_render[prop];
				}
			})

			return arrResult.length > 1 ? arrResult : arrResult[0];
		},

		domDel(target, prop, value, setFantom, set){
			delete this._qb_render[prop];
			//console.error(this, target, prop, value, setFantom, set)
		},

		domStop(target, prop, value, setFantom, set){
			this._qb_render[prop].runRender = false;
			//console.error(this, target, prop, value, setFantom, set)
		},

		domRun(target, prop, value, setFantom, set){
			this._qb_render[prop].runRender = true;
			qb.domRender([this])
			//console.error(this, target, prop, value, setFantom, set)
		},

		domSetCb(target, prop, value, setFantom, set){
			prop = prop[0] == '_' ? prop.substring(1).replace('_cb', '') : prop.replace('_cb', '');
			let colection = target.__qb_domEl_.__qb_dom_.colection;

			colection.forEach(function(dom) {
				if(!dom._qb_render)
					dom._qb_render = {
						cbArrs: {[prop]: []}
					};

				else if(!dom._qb_render.cbArrs)
					dom._qb_render.cbArrs = {[prop]: []};

				else if(!dom._qb_render.cbArrs[prop])
					dom._qb_render.cbArrs[prop] = [];

				dom._qb_render.cbArrs[prop].push(value)

			})
		},

		methods: {
			_hashDomColection(data){
				if(!qb.methods._hashDomColection.hashArr)
					qb.methods._hashDomColection.hashArr = qb.methods._goFormatDom();
				if(!data[0])
					data = [data];

				qb.methods._hashDomColection.hashArr.__qb_domEl_.__qb_dom_.colection = [...data];
				return qb.methods._hashDomColection.hashArr;
			},

			_renderPost(cb){
				qb.domPostRenderActive = false;
				cb();
				qb.domPostRender()
				qb.domPostRenderActive = true;
			},

			_goFormatDom(el = false){
				let select = qb.run({});
				select.__qb_domEl_.__qb_dom_ = {colection: el ? [el] : []};
				return select;
			},

			_createNode(html){
				let nodeFantom = document.createElement('div');
				let domNew;

				nodeFantom.innerHTML = html;

				let node = nodeFantom.childNodes;
				domNew = qb.methods._createDom();

				Array.from(node).reverse().forEach((el)=>{
					
					domNew.__qb_domEl_.__qb_dom_.colection.push(el);
				})

				nodeFantom.remove();
				
				return domNew;
			},

			_createDom(data) {
				let select = qb.run({});
				if(!data)
					select.__qb_domEl_.__qb_dom_ = {colection: []};
				else if(typeof data == 'string'){
					select.__qb_domEl_.__qb_dom_ = {colection: [document.createElement(data)]}
				}
				else
					select.__qb_domEl_.__qb_dom_ = {colection: data.length ? data : [data]}
				return select;
			},

			_delay(ms,cb){
				let result = this.proxy;
		
				setTimeout(function() {
					console.log(result)
					cb.call(result,result)
				},ms);
				return result;
			},

			_query(selector){ // поиск элемента в документе по селектору
				let select = qb.run({});
				select.__qb_domEl_.__qb_dom_ = {colection: [document.querySelector(selector)]};
				return select;
			},

			_queryAll(selector){ // поиск элемента в документе по селектору
				let select = qb.run({});
				select.__qb_domEl_.__qb_dom_ = {colection: [...document.querySelectorAll(selector)]};
				return select;
			},

			_find(selector){ // поиск дочернего элемента по селектору
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let select = qb.methods._createDom();

				app.colection.forEach((val,key)=>{
					let colection = val.querySelector(selector);
				 	if(colection)
				 		select.__qb_domEl_.__qb_dom_.colection.push(colection);
				})
				
				return select;
			},

			_findAll(selector){  // поиск дочерних элементов по селектору
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let select = qb.methods._createDom();

				app.colection.forEach((val,key)=>{
					let colection = [ ... val.querySelectorAll(selector)];
					if(colection)
						select.__qb_domEl_.__qb_dom_.colection = colection;
				})
				select.__qb_domEl_.__qb_dom_.colection = [...new Set(select.__qb_domEl_.__qb_dom_.colection)]
				return select;
			},

			_child(selector){ // поиск непосредственно ребенка элемента по селектору
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let select = qb.methods._createDom();
				app.colection.forEach((val,key)=>{
					let added = false;
					Array.from(val.children).forEach((child)=>{
						if(child.matches(selector) && !added){
							select.__qb_domEl_.__qb_dom_.colection.push(child);
							added = true;
						}
					})

				})
				
				return select;
			},

			_childAll(selector){ // поиск непосредственно детей элемента по селектору
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let select = qb.methods._createDom();

				app.colection.forEach((val,key)=>{
					Array.from(val.children).forEach((child)=>{
						if(child.matches(selector))
							select.__qb_domEl_.__qb_dom_.colection.push(child);
					})
				})
				select.__qb_domEl_.__qb_dom_.colection = [...new Set(select.__qb_domEl_.__qb_dom_.colection)];
				return select;
			},

			_parent(selector){  // поиск родителя элемента по селектору
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let select = qb.methods._createDom();

				app.colection.forEach((val,key)=>{
					select.__qb_domEl_.__qb_dom_.colection.push(val.closest(selector))
				})

				select.__qb_domEl_.__qb_dom_.colection = [...new Set(select.__qb_domEl_.__qb_dom_.colection)];
				return select;
			},

			_parentAll(selector){ // поиск родителей элемента по селектору
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let select = qb.methods._createDom();
				
				function parAll(el){
					if(el.parentElement.nodeName == 'HTML') return false;
					if(el?.parentElement?.matches(selector)){
						select.__qb_domEl_.__qb_dom_.colection.push(el.parentElement)
						parAll(el.parentElement)
					}
				}

				app.colection.forEach((val,key)=>{
					parAll(val)
				})
				
				select.__qb_domEl_.__qb_dom_.colection = [...new Set(select.__qb_domEl_.__qb_dom_.colection)];
				return select;	
			},

			// найти следующий эллемент по селектру, возвращает набор qb DOM
			_next(selector = '*'){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let select = qb.methods._createDom();

				app.colection.forEach((val,key)=>{
					if(val?.nextElementSibling?.matches(selector))
						select.__qb_domEl_.__qb_dom_.colection.push(val.nextElementSibling)
				})

				return select;
			},

			// найти предидущий эллемент по селектру, возвращает набор qb DOM
			_prev(selector = '*'){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let select = qb.methods._createDom();

				app.colection.forEach((val,key)=>{
					if(val?.previousElementSibling?.matches(selector))
						select.__qb_domEl_.__qb_dom_.colection.push(val.previousElementSibling)
				})

				return select;
			},

			// получить из набора конкретный эллемент по номеру или селектору, возвращает набор qb DOM
			_get(idOrSelect){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let select = qb.methods._createDom();

				if(typeof idOrSelect == 'number'){
					select.__qb_domEl_.__qb_dom_.colection.push(app.colection[idOrSelect])
					return select;
				}

				app.colection.forEach((val,key)=>{
					if(val.matches(idOrSelect))
						select.__qb_domEl_.__qb_dom_.colection.push(val)
				})

				return select;
			},

			// добавить эллемент в qb дом набор
			_add(dom){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let select = qb.methods._createDom();

				app.colection.forEach((val,key)=>{
					select.__qb_domEl_.__qb_dom_.colection.push(val);
				})

				select.__qb_domEl_.__qb_dom_.colection.push(dom);

				return select;
			},

			// удалить эллемент из qb дом набора
			_delete(idOrSelect){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let select = qb.methods._createDom();

				app.colection.forEach((val,key)=>{
					if(typeof idOrSelect == 'number'){
						if(key != idOrSelect)
							select.__qb_domEl_.__qb_dom_.colection.push(val);
					}else{
						if(!val.matches(idOrSelect))
							select.__qb_domEl_.__qb_dom_.colection.push(val);
					}
				})

				return select;
			},

			// Вставка html и возможность вернуть встроенный код в виде набора
			_html(html, rtrn = false){
				let app = this.proxy.__qb_domEl_.__qb_dom_;

				app.colection.forEach((element)=>{
					element.innerHTML = html;
				})

				return rtrn ? this.proxy._childAll('*') : this.proxy;
			},

			// Вставка вначале и возможность вернуть встроенный код в виде набора
			_prepend(html, rtrn = false){
				let app = this.proxy.__qb_domEl_.__qb_dom_;

				let nodeFantom = document.createElement('div');
				let domNew;

				app.colection.forEach((element)=>{

					nodeFantom.innerHTML = html;

					let node = nodeFantom.childNodes;
					domNew = qb.methods._createDom();

					Array.from(node).reverse().forEach((el)=>{
						element.prepend(el)
						domNew.__qb_domEl_.__qb_dom_.colection.push(el);
					}) 
				})

				nodeFantom.remove();
				
				return rtrn ? domNew : this.proxy;
			},

			// Вставка вконце и возможность вернуть встроенный код в виде набора
			_append(html, rtrn = false){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				
				let nodeFantom;
				if(typeof html === 'string') 
					nodeFantom = document.createElement('div');

				let domNew;
				let node;

				app.colection.forEach((element)=>{
					
					if(typeof html === 'string') {
						nodeFantom.innerHTML = html;
						node = Array.from(nodeFantom.childNodes);
					}
					else
						node = html.__qb_domEl_.__qb_dom_.colection

					domNew = qb.methods._createDom();

					node.forEach((el)=>{
						element.append(el)
						domNew.__qb_domEl_.__qb_dom_.colection.push(el);
					}) 
				})

				if(typeof html === 'string') 
					nodeFantom.remove();

				return rtrn ? domNew : this.proxy;
			},
			// Вставка до и возможность вернуть встроенный код в виде набора
			_before(html, rtrn = false){
				let app = this.proxy.__qb_domEl_.__qb_dom_;

				let nodeFantom = document.createElement('div');
				let domNew;
				
				app.colection.forEach((element)=>{

					nodeFantom.innerHTML = html;

					let node = nodeFantom.childNodes;
					domNew = qb.methods._createDom();

					Array.from(node).forEach((el)=>{
						element.before(el)
						domNew.__qb_domEl_.__qb_dom_.colection.push(el);
					}) 
				})

				nodeFantom.remove();
				
				return rtrn ? domNew : this.proxy;
			},

			// Вставка после и возможность вернуть встроенный код в виде набора
			_after(html, rtrn = false){
				let app = this.proxy.__qb_domEl_.__qb_dom_;

				let nodeFantom = document.createElement('div');
				let domNew;
				
				app.colection.forEach((element)=>{
					nodeFantom.innerHTML = html;

					let node = nodeFantom.childNodes;
					domNew = qb.methods._createDom();

					Array.from(node).reverse().forEach((el)=>{
						element.after(el)
						domNew.__qb_domEl_.__qb_dom_.colection.push(el);
					}) 
				})

				nodeFantom.remove();


				return rtrn ? domNew : this.proxy;
			},

			// проверка на наличие класса
			_classCheck(){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let result = false;
				
				Object.entries(arguments).forEach(([key,value])=>{
					app.colection.forEach((element)=>{
						if(!result)
							result = element.classList.contains(value);
					})
				})

				return result;
			},

			_classCheckAll(){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let result = true;
				
				Object.entries(arguments).forEach(([key,value])=>{
					app.colection.forEach((element)=>{
						if(result)
							result = element.classList.contains(value);
					})
				})

				return result;
			},

			_classCheckArr(){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let result = [];
				
				Object.entries(arguments).forEach(([key,value])=>{
					app.colection.forEach((element)=>{
						result.push(element.classList.contains(value)) 
					})
				})

				return result;
			},

			// добавление класса
			_classAdd(){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				Object.entries(arguments).forEach(([key,value])=>{
					if(!value) return false;
					app.colection.forEach((element)=>{
						element.classList.add(value)
					})
				})

				return this.proxy;
			},

			// Удаление класса
			_classDel(){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				Object.entries(arguments).forEach(([key,value])=>{
					app.colection.forEach((element)=>{
						element.classList.remove(value)
					})
				})

				return this.proxy;
			},

			// Проверка attr у эллемента
			_attrCheck(){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let result = false;

				Object.entries(arguments).forEach(([key,value])=>{
					app.colection.forEach((element)=>{
						if(!result)
							result = element.getAttribute(value).length ? element.hasAttribute(value) : false;
					})
				})

				return result;
			},

			_attrCheckAll(){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let result = true;

				Object.entries(arguments).forEach(([key,value])=>{
					app.colection.forEach((element)=>{
						if(result)
							result = element.getAttribute(value).length ? element.hasAttribute(value) : false;
					})
				})

				return result;
			},

			_attrCheckArr(){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let result = [];
				
				Object.entries(arguments).forEach(([key,value])=>{
					app.colection.forEach((element)=>{
						result.push(element.getAttribute(value).length ? element.hasAttribute(value) : false);
					})
				})

				return result;
			},	

			// задание attr эллементу и его получение
			_attrGet(){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let result = [];
				
				Object.entries(arguments).forEach(([key,value])=>{
					app.colection.forEach((element)=>{
						result.push(element.getAttribute(value));
					})
				})

				return result.length > 1 ? result : result[0];
			},	

			// задание attr эллементу и его получение
			_attrSet(name, value){
				let app = this.proxy.__qb_domEl_.__qb_dom_;

				app.colection.forEach((element)=>{
					element.setAttribute(name, value);
				});

				return this.proxy;
			},	

			// задание attr эллементу и его получение
			_attrAdd(name, value, unite = ' '){
				let app = this.proxy.__qb_domEl_.__qb_dom_;

				app.colection.forEach((element)=>{
					element.setAttribute(name, element.getAttribute(name) + (element.getAttribute(name) ? unite : '') + value);
				});

				return this.proxy;
			},

			// Удаление attr у эллемента
			_attrDel(name){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let remove = [];
				app.colection.forEach((el)=>{
					[...arguments].forEach((name)=>{
						remove.push(el.removeAttribute(name));
					})
				});
				
				return this.proxy;
			},

			// Задание стилей для элемента через объект
			_css(styles){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				
				if(!styles)
					return this.proxy._cssGet();
				else if(styles == true) 
					return this.proxy._cssGetComputed();

				app.colection.forEach((el)=>{
					for(key in styles){
						el.style.setProperty(key, styles[key]);
					}
				})

				return this.proxy;
			},

			// Добавление стилей для эллемента через объект
			_cssAdd(styles){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let newcss = {};

				for(let key in styles){
					newcss[key] = styles[key];
				}

				app.colection.forEach((el)=>{
					let getcssArr = el.style.cssText.split(';');
					let getcss = {};
					
					getcssArr.forEach((val,key)=>{
						getcssArr[key] = val.split(':')
						getcss[getcssArr[key][0].trim()] = getcssArr[key][1];
					});

					for(let key in newcss){
						getcss[key] = newcss[key];
					}

					let strcss = '';
					for(let key in getcss){
						if(getcss[key])
							strcss += `${key}: ${getcss[key]};`;
					}
					el.style.cssText = strcss;
					
				})
				return this.proxy;
			},

			// Получить стили эллемента
			_cssGet(...arg){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let result = [];
				app.colection.forEach((el,i)=>{
					let css = el.style.cssText.split(';')
					let cssObj = {};
					result[i] = {};
					css.forEach((val,key)=>{
						css[key] = val.split(':');
						if(css[key][1])
							cssObj[css[key][0].trim()] = css[key][1].trim();
					});

					if(arg.length){
						arg.forEach((name)=>result[i][name] = cssObj[name])
					}else{
						result[i] = cssObj;
					}
				})
				
				return result.length > 1 ? result : result[0];
			},

			_cssGetComputed(...arg){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let result = [];
				app.colection.forEach((el,i)=>{
					let css = el.style.cssText.split(';')
					let cssObj = {};
					result[i] = {};
					css.forEach((val,key)=>{
						css[key] = val.split(':');
						if(css[key][1])
							cssObj[css[key][0].trim()] = css[key][1].trim();
					});

					if(arg.length){
						arg.forEach((name)=>{
							result[i][name] = cssObj[name];
							if(!result[i][name])
								result[i][name] = window.getComputedStyle(el)[name]
						})
					}else{
						if(Object.keys(cssObj).length)
							result[i] = cssObj;
						else
							result[i] = window.getComputedStyle(el);
					}
				})
				
				return result.length > 1 ? result : result[0];
			},

			// удаление стилей у эллемента
			_cssDel(...arg){
				if(arg.length){
					let cssObj = {};
					arg.forEach((key)=>{
						cssObj[key] = '';
					})
					this.proxy._cssAdd(cssObj)
					
				}else
					this.proxy._attrDel('style');

				return this.proxy;
			},

			// получить отступы объекта от документа
			_offset(){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let result = [];
				let offset = (arguments.length>0) ? arguments : ['left','right','bottom','top','x','y','height','width'];
				app.colection.forEach((element,id)=>{
					result[id] = {};
					Object.entries(offset).forEach(([key,value])=>{
						let offsets = element.getBoundingClientRect();
						result[id][value] = offsets[value];
					})
				})
				
				return result.length > 1 ? result : result[0];
			},

			// получить отступы объекта от родительского эллемента
			_outset(){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let result = [];
				let offset = (arguments.length>0) ? arguments : ['left','top','height','width'];
				
				app.colection.forEach((element,id)=>{
					result[id] = {};
					Object.entries(offset).forEach(([key,value])=>{
						let offsets = element['offset'+value.charAt(0).toUpperCase() + value.slice(1)];
						result[id][value] = offsets;
					})
				})
				return result.length > 1 ? result : result[0];	
			},

			//современный способ получения данных об отступах
			_rectset(){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				let result = [];
				
				app.colection.forEach((element)=>{
					result.push(element.getBoundingClientRect());
				})

				return result.length > 1 ? result : result[0];	
			},

			// удалить эллемент со страницы 
			_remove(){
				let app = this.proxy.__qb_domEl_.__qb_dom_;
				app.colection.forEach((val,key)=>{
					val.parentNode.removeChild(val)
				})
			},

			// получить стандартный массив или dom
			_dom(id = false){ // Получение массива нативного дом древа или конкретного элемента по id в массиве
				return typeof id !== 'boolean' ? this.proxy.__qb_domEl_.__qb_dom_.colection[id] : this.proxy.__qb_domEl_.__qb_dom_.colection;
			},

			// получить стандартный массив или dom
			_qbDom(id = false){ // Получение массива нативного дом древа или конкретного элемента по id в массиве
				return typeof id !== 'boolean' ? qb.methods._goFormatDom(this.proxy.__qb_domEl_.__qb_dom_.colection[id]) : qb.methods._goFormatDom(this.proxy.__qb_domEl_.__qb_dom_.colection);
			},
		 
			_domEach(cb){
				let colection = this.proxy.__qb_domEl_.__qb_dom_.colection;
				for(let i = 0; i<colection.length; i++){
					cb(qb.methods._goFormatDom(colection[i]),i)
				}
			},

			_data(obj){

			},

			_arrRemove(item){
				console.log(this)
				index = this.proxy.indexOf(item);
				if (index !== -1) {
				  this.proxy.splice(index, 1);
				}
				return this.proxy;
			},

			_forEach(cb){
				let app = this.proxy;
				// Object.keys(app).forEach((key, i)=>{
				// 	cb(app[key],key,i)
				// })

				let keys = Object.keys(app)
				for(let i = 0; i<keys.length; i++){
					cb(app[keys[i]],keys[i],i,keys.length-1)
				}
				
			},

			_childArr(key){
				let app = this.proxy;
				let result = [];

				app._forEach(function(obj) {
					obj._forEach(function(obj) {
						result.push(obj)
					})
				})
				return qb.run({
					data: {
						arr: [result]
					}
				}).arr[0];
			},

			_information(component){  // получение информации по элементу
				return this
			},

			_checkData(){  // получение информации по элементу
				let res = JSON.parse(JSON.stringify(this.proxy));//{...this.proxy}
				return res
			},

			_on(selector){ // присвоить будущий эвент дочерним эментам
				qb.methods._event.saveOn = {elem: this.proxy, children: selector}

				return this.proxy;
			},

			_event(ev, cb){
				let children = false;

				if(qb.methods._event.saveOn){
					if(qb.methods._event.saveOn.elem == this.proxy)
						children = qb.methods._event.saveOn.children;

					qb.methods._event.saveOn = undefined;
				}
				
				

				ev = ev.split('.');

				let nameFun = ev[1];
				let event = ev[0];

				this.proxy.__qb_domEl_.__qb_dom_.colection.forEach(function(dom) {
					
					if(!dom._qb_events_)
						dom._qb_events_ = {[event]:[]};
					
					if(!dom._qb_events_[event])
						dom._qb_events_[event] = [];

					let double = dom._qb_events_[event].findIndex(e => e.name === nameFun);
					
					if(double !== -1)
						dom._qb_events_[event][double].cb = cb;
					else
						dom._qb_events_[event].push({name: nameFun, cb: cb, runing: true});

					if(!dom['on'+event]){
						dom['on'+event] = function(e) {
							if(children && !e.target.matches(children))
								return false;

							for(let i = 0; i < dom._qb_events_[event].length; i++){
								if(!dom._qb_events_[event][i].runing) return false;
								dom._qb_events_[event][i].cb.call(qb.methods._createDom(this),e);
							}
						};
					}
				}) 
			},


			// Удалить эвент
			_eventDel(ev){

				ev = ev.split('.');

				let nameFun = ev[1];
				let event = ev[0];

				this.proxy.__qb_domEl_.__qb_dom_.colection.forEach(function(dom) {
					let id = dom._qb_events_[event].findIndex(e => e.name === nameFun);
					if(id != -1){
						dom._qb_events_[event].splice(id, 1);
					}
				})
			},

			// Остановить cb эвента
			_eventStop(ev){

				ev = ev.split('.');

				let nameFun = ev[1];
				let event = ev[0];

				this.proxy.__qb_domEl_.__qb_dom_.colection.forEach(function(dom) {
					let id = dom._qb_events_[event].findIndex(e => e.name === nameFun);
					if(id != -1){
						dom._qb_events_[event][id].runing = false;
					}
				})
			},

			// Запустить cb эвента
			_eventRun(ev){

				ev = ev.split('.');

				let nameFun = ev[1];
				let event = ev[0];

				this.proxy.__qb_domEl_.__qb_dom_.colection.forEach(function(dom) {
					let id = dom._qb_events_[event].findIndex(e => e.name === nameFun);
					if(id != -1){
						dom._qb_events_[event][id].runing = true;
					}
				})
			},

			_glue(data){
				let elemMain = this;
				[...arguments].forEach(function(data) {
					if(data.children || data.find){
						if (data.setter){
							data.setter.__qb_proxy_linkProxy_[data.setter.__qb_proxy_linkProp_]._forEach(function(e,key) {
								qb.targets[data.setter.__qb_link_.split('.')[0]].proxy._glue({
									setter: data.setter.__qb_proxy_linkProxy_[data.setter.__qb_proxy_linkProp_][key+'_$'],
									setter_cb: data.setter_cb,
									run_cb: data.run_cb
								})
							})
						}else{
							elemMain.proxy.__qb_domEl_.__qb_dom_.colection.forEach(function(el){
								// Мутацию нужно внедрить но пока забьем хер
								// if(elemMain.set.mutationObserver)
								// 	console.log(elemMain.set.mutationObserver)
								// elemMain.set.mutationObserver = new MutationObserver(function(mutations) {
								// 	mutations.forEach(function(mutation) {
								// 		let addedNodes = Array.from(mutation.addedNodes).filter(el => ('attributes' in el));
								// 		addedNodes.forEach(function(mutationEl){
								// 			if(mutationEl.matches(data.children) && data.children)
								// 				goChildrenGlue(mutationEl, data)

								// 			if(data.find)
								// 				elemMain.proxy._findAll(data.find)._dom().forEach(function(elFind) {
								// 					if(mutationEl == elFind || mutationEl.contains(elFind))
								// 						goChildrenGlue(elFind, data)
								// 				});
								// 		})
								// 	});
								// });

								// elemMain.set.mutationObserver.observe(el, {
								// 	attributes: true,
								// 	// characterData: true,
								// 	childList: true,
								// 	// subtree: true,
								// 	// attributeOldValue: true,
								// 	// characterDataOldValue: true
								// });
								
								let selectType = data.children ? data.children : data.find		
								
								el.querySelectorAll(selectType).forEach(function(childrenEl) {
									goChildrenGlue(childrenEl,data)
								})

								function goChildrenGlue(el,data){
									let qbDom = qb.methods._goFormatDom(el);
									Object.keys(data).forEach(function(key){
										if(key in el){
											qbDom['_'+key] = data[key];
										}
									})
									
								}
							})
						}
					} else if (data.setter){
						if(typeof data.setter_cb == 'object'){
							data.setter_cb.forEach(function(cb) {
								if(data.setter.length) data.setter.forEach(function(setter) {
									setter._setter = cb.bind(setter);
									if(data.run_cb) setter._setterGetRun(); //cb.call(data.setter);
								}); else {
									data.setter._setter = cb.bind(data.setter);
									if(data.run_cb) data.setter._setterGetRun(); //cb.call(data.setter);
								}
							})
						}else{
							if(data.setter.length) data.setter.forEach(function(setter) {
								setter._setter = data.setter_cb.bind(setter);
								if(data.run_cb) setter._setterGetRun();//data.setter_cb.call(data.setter);
							}); else {
								data.setter._setter = data.setter_cb.bind(data.setter);
								if(data.run_cb) data.setter._setterGetRun();//data.setter_cb.call(data.setter);
							}
						}
					}else{
						elemMain.proxy._domEach(function(qbDom) {
							Object.keys(data).forEach(function(key){
								if(key in qbDom._dom(0)){
									qbDom['_'+key] = data[key];
								}else if(key.replace('_cb') != key){
									qbDom['_'+key] = data[key];
								}
								
								if(data.run_cb) data[key+'_cb'] ? data[key+'_cb']() : data[key+'_cb']; /////////////////////////// Не верное исполнение
							})
							
						})
					}
				})
				return this.proxy
			},

			_glueDel(setup){
				if (setup.setter){
					if(typeof setup.setter_cb == 'object'){
						setup.setter_cb.forEach(function(cb) {
							setup.setter._setter.forEach(function(cbSet, id){
								if(cbSet.name == cb.name && cbSet.type == 'setter'){
									setup.setter._setter.splice(id, 1)
								}
							})
						})
					}else if(typeof setup.setter_cb == 'function'){
						setup.setter._setter.forEach(function(cbSet, id){
							if(cbSet.name == setup.setter_cb.name && cbSet.type == 'setter'){
								setup.setter._setter.splice(id, 1)
							}
						})
					}else{
						//let id = 0;
						for(let id = 0; id < setup.setter._setter.length; id++){
							if(setup.setter._setter[id].type == 'setter'){
								setup.setter._setter.splice(id, 1)
								id--;
							}
						}
					}
				}
			}
		}
	}

	function initNewQb() {
		let QB = {};
		let LOC = {};

		QB.run = (object, setNewApp, render) => {
			
			if(typeof setNewApp === "function")
				render = setNewApp;
			
			setNewApp = {app: true, fantom: true, forming: true, render: true, proxy: true, return: true, ...setNewApp}

			
			let objectApp = {}
			objectApp.__QB__data = object.data ? object.data : {};
			if(setNewApp.app) objectApp.__QB__appPosition = object.app ? object.app : "body";

			let set = {
				forming: {},
				fantom: {},
				app: {},
				lastGetter: {}
			};

			if(setNewApp.fantom) set.fantom = LOC.fantom(objectApp.__QB__data); // создание фантома
			if(setNewApp.forming) set.forming = LOC.forming(objectApp, set.fantom, set); // формируем древо данных
			
			if(setNewApp.proxy) {
				set.app = LOC.proxy(set.forming, set.fantom, set); // собираем инициализированный прокси
			} 

			// сохроняем созданный прокси объект
			qb.targets.push({target: set.app, proxy: set.app, fantom: set.fantom, set: set})

			return setNewApp.return ? set.app : undefined;
		};

		LOC.primitiveCheck = (data, type = false) =>{
			if(!type)
				return data?.constructor.name != 'Object' && data?.constructor.name != 'Array' ? false : true;
			else{
				return data?.constructor.name.toLowerCase() == type || (!data?.constructor ? typeof data == type : false) || ((!data?.constructor && type == "null") ? data == null : false);
			}
		};



		
		LOC.fantom = (object,link = '') => {
			if(link == '')
				link = GLOBAL.targets.length;
			
			const fantom = {__qb_glues_: [], __qb_runGlues_: false, __qb_events_: {}, __qb_keyIs_: `${link}`, __qb_link_: `${link}`};
			Object.keys(object).forEach(function(key) {
				if(LOC.primitiveCheck(object[key]))
					fantom[key] = {__qb_glues_: [], __qb_runGlues_: false, __qb_events_: {}, __qb_keyIs_: key, __qb_link_: `${link}.${key}`, ...LOC.fantom(object[key],`${key == '_value'? link: link+'.'+key}`)};
				else
					fantom[key] = {__qb_glues_: [], __qb_runGlues_: false, __qb_events_: {}, __qb_keyIs_: key, __qb_link_: `${link}.${key}`};
			})

			return fantom;
		};




		LOC.forming = (object, setFantom, set) => {
			let forming;
			if(Array.isArray(object))
				forming = [];
			else
				forming = {};

			if(object.__QB__appPosition){
				object.__QB__data.__qb_domEl_ = {...LOC.colObj};
				object.__QB__data.__qb_domEl_.__qb_dom_ = {colection: [document.querySelector(object.__QB__appPosition)]};
				object = object.__QB__data;
			}

			Object.keys(object).forEach(function(key) {
				if(key == '__qb_domEl_' || object[key].hasOwnProperty('__qb_proxy_linkProp_')){
					forming[key] = object[key];
				}
				else if(LOC.primitiveCheck(object[key])){
					forming[key] = LOC.proxy(LOC.forming(object[key], setFantom[key], set), setFantom[key], set);
				}
				else{
					forming[key] = object[key];
				}
			})
			return forming;
		};




		LOC.domSetCheck = (target, prop, test=false) => {
			let ignoreList = ['_remove', '_prepend', '_append', '_before', '_after', '_event'];
			let inRun = ['_numValue'];

			if(ignoreList.includes(prop))
				return false;

			if(inRun.includes(prop))
				return true;

			let colection = target.__qb_domEl_?.__qb_dom_.colection[0];
			
			if( typeof colection == "undefined" || LOC.primitiveCheck(prop,'symbol'))
				return false;

			prop = prop.replace('_cb', "").replace('_$', "").substring(1);
			
			return typeof colection[prop] != "undefined" || GLOBAL.addSetDom.hasOwnProperty(prop);
		};



		LOC.runGlues = (proxy, target, setFantom, prop, linkFantom) => {
			
			let link = linkFantom ? linkFantom : setFantom[prop].__qb_link_;
			let arrLink = link.split('.');
			let obj = GLOBAL.targets[arrLink[0]].target;
			let fantom = GLOBAL.targets[arrLink[0]].fantom;
			
			let objArr = [];
			let fantomArr = [];
			arrLink.shift();
			
			arrLink.forEach((key)=>{
				objArr.push({target: undefined, parent: obj, prop: key, targetCall: undefined, targetLink: undefined});
				obj = obj[key];
				fantom = fantom[key];
				fantomArr.push(fantom);

				if(fantom.__qb_runGlues_)
					fantom.__qb_runGlues_(true);
			})

			arrLink.reverse();
			fantomArr.reverse();
			objArr.reverse();

			let targetSetter;
			arrLink.forEach((key,i)=>{

				if(i == 0){
					targetSetter = objArr[i];
					targetSetter.targetLink = [...arrLink].reverse();
					Object.defineProperty(targetSetter, "target", {
						get() {
							return this.parent[this.prop];
						},
						set(set) {
							this.parent[this.prop] = set;
						}
					});
				}

				let linkVars = targetSetter.parent[targetSetter.prop+'_$'].__qb_proxy_linkVar_;
				if(linkVars.length > 0){
					
					linkVars.forEach(function(linkVar){
						// console.log(linkVar)
						// console.error(linkVar.setFantom,linkVar.prop)
						if(!linkVar.runing){
							linkVar.runing = true;
							let linkFantom = linkVar.setFantom.__qb_link_+'.'+linkVar.prop
							LOC.runGlues(linkVar.target, linkVar.proxy, linkVar.setFantom, linkVar.prop, linkFantom)
							linkVar.runing = false;
						}
					})
				}
				
				fantomArr[i].__qb_glues_.forEach(function(el){
					if(targetSetter.targetCall != objArr[i].parent[objArr[i].prop])
						targetSetter.targetCall = objArr[i].parent[objArr[i].prop];

					if(el.type == "setter") {
						// console.log(el,targetSetter)
						el.cb(targetSetter);
					}
				})
			})
		};




		LOC.lastGetter = (getter, proxy, fantom, set) =>{ // последний getter в тикущем прокси объекте
			if(getter !== undefined){
				LOC.lastGetter.getter = {target: getter.target, prop: getter.prop, proxy: proxy, fantom: fantom, set: set, methods: GLOBAL.methods};
				GLOBAL.lastGetter.getter = LOC.lastGetter.getter;
				set.lastGetter = LOC.lastGetter.getter;
			}
			else 
				return LOC.lastGetter.getter;
		};

		

		LOC.proxy = (object, setFantom, set) => {
			let QBprox = new Proxy(object, {

				get(target, prop, proxy) {
					if(prop == '_renderStop'){
						GLOBAL.domPostRenderActive = false;
						return false;
					}
					if(prop == '_renderRun'){
						GLOBAL.domPostRenderActive = true;
						GLOBAL.domPostRender();
						return false;
					}
					if(prop == '_renderPost'){
						return GLOBAL.domRenderPostArr;
					}

					// Получить прокси ссылку на прокси элемент
					if(!target.hasOwnProperty(prop) && !LOC.primitiveCheck(prop, 'symbol') && prop?.slice(-2) == "_$" && !LOC.domSetCheck(target, prop)){
						let value;
						let propLink = prop.replace('_$','');
						if(target[propLink].hasOwnProperty('__qb_proxy_linkProp_')){
							value = GLOBAL.$(target[propLink].__qb_proxy_linkProxy_[target[propLink].__qb_proxy_linkProp_]);
							LOC.lastGetter({target: target, prop: propLink}, QBprox, setFantom, set)
						}else{
							LOC.lastGetter({target: target, prop: propLink}, QBprox, setFantom, set)
							//GLOBAL.targetSave(propLink, target, proxy, set, setFantom);
							value = GLOBAL.$(target[prop]);
						}
						return value;
					}
					if(target[prop]?.hasOwnProperty('__qb_proxy_linkProp_')){ ///////////////
						return target[prop].__qb_proxy_linkObj_[target[prop].__qb_proxy_linkProp_]; ///////////////
					} ///////////////


					if(!target.hasOwnProperty(prop) && LOC.domSetCheck(target, prop) && target.hasOwnProperty("__qb_domEl_")){
						return qb.domGet(target,prop,setFantom,set)
					}
					

					if(GLOBAL.methods[prop] && typeof GLOBAL.methods[prop] === 'function'){
						LOC.lastGetter({target: target, prop: prop}, QBprox, setFantom, set)
						return GLOBAL.methods[prop].bind({proxy: proxy, fantom: setFantom, set: set});
					}
					

					//GLOBAL.targetSave(prop, target, proxy, set, setFantom);

					LOC.lastGetter({target: target, prop: prop}, QBprox, setFantom, set)

					return Reflect.get(target, prop);
				},

				set(target, prop, value, proxy){
					if(prop == '_renderPost'){
						GLOBAL.domRenderPostAdd(value)
						return;
					}

					if(GLOBAL.methods[prop] && typeof GLOBAL.methods[prop] !== 'function'){
						return GLOBAL.methods[prop] = {target: proxy, set: value};
					}

					/////////// ЭТО ССЫЛКИ НА СТРОКИ ИЗ ДРУГИХ ОБЪЕКТОВ
					if(target[prop]?.__qb_proxy_linkProp_){ ///////////////
						target[prop].__qb_proxy_linkProxy_[target[prop].__qb_proxy_linkProp_] = value; ///////////////

					} ///////////////
					/////////// ЭТО БЫЛИ ССЫЛКИ НА СТРОКИ ИЗ ДРУГИХ ОБЪЕКТОВ

					else {

						if(!target.hasOwnProperty(prop) && LOC.domSetCheck(target, prop) && target.hasOwnProperty("__qb_domEl_")){
							if(prop.slice(-3) != '_cb') {
								GLOBAL.domSet(target,prop,value,setFantom,set,proxy);
							}
							else 
								GLOBAL.domSetCb(target,prop,value,setFantom,set, proxy);
							return;
						}


						let setFantomDef = {__qb_glues_: [], __qb_runGlues_: false, __qb_events_: {}, __qb_keyIs_: prop, __qb_link_: `${setFantom.__qb_link_?setFantom.__qb_link_:''}.${prop}`,};
						if(setFantom[prop])
						 	setFantomDef = setFantom[prop];
						

						if(typeof value == "object"){

							setFantom[prop] = LOC.fantom({_value: value},setFantomDef.__qb_link_);
							setFantom[prop].value = {...setFantom[prop]._value, ...setFantomDef};
							let resultValue = !value._proxy ? LOC.forming({_value:value}, setFantom[prop], set) : {_value:value};
							setFantom[prop] = {...setFantom[prop]._value, ...setFantomDef};
							Reflect.set(target, prop, resultValue._value);

							if(value.__qb_proxy_linkProp_){
								value.__qb_proxy_linkVar_.push({target: target, proxy: proxy, setFantom: setFantom, prop:prop, runing: false})
							}
						}else{
							setFantom[prop] = setFantomDef;
							Reflect.set(target, prop, value);
						}


						if(value._proxy){
							value.__qb_proxy_linkFantom_.__qb_glues_ = [...setFantom[prop].__qb_glues_, ...value.__qb_proxy_linkFantom_.__qb_glues_];
							value.__qb_proxy_linkFantom_.__qb_runGlues_ = setFantom[prop].__qb_runGlues_ || value.__qb_proxy_linkFantom_.__qb_runGlues_;
							value.__qb_proxy_linkFantom_.__qb_events_ = {...setFantom[prop].__qb_events_, ...value.__qb_proxy_linkFantom_.__qb_events_}
							setFantom[prop] = value.__qb_proxy_linkFantom_;
						}

					}

					LOC.runGlues(target, target[prop], setFantom, prop)
				}

			});

			return QBprox;
		};


		return QB.run(...arguments);
	}

	

	return GLOBAL;
})()