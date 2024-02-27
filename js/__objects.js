	function __clone(_src) {
        var _obj = {};
		if (typeof _src == "Array")
			_obj = [];

		for(var i in _src)
			if (i != "__static" && typeof _src[i] in ["Object","Array"])
				_obj[i]=__clone(_src[i]);
			else
				_obj[i]=_src[i];

		return _obj;
	}

    function __new(_class) {
        if (typeof _class !== "object"){
            if (typeof _class === "string" && typeof window[_class] === "object")
                _class = window[_class];
            else return null;
        }
		//if (typeof _class.__parents == "undefined") _class.__parents = [];
        var _obj = __clone(_class);

        var _pars = [];
		for(var i=1;i in arguments;i++)
			_pars.push(arguments[i]);

        _obj.__this=_obj;
        if (typeof _obj.__construct == "function")
            _obj.__construct.apply(_obj,_pars);

		return _obj;
    }

    function __super(_obj,_fct) {
        var _parent = _obj.__parents[0];
		if (typeof _parent == "undefined") return;
        if (typeof _parent[_fct] != "function") return;

        var _pars = [];
		for(var i=2;i in arguments;i++)
			_pars.push(arguments[i]);

		_parent[_fct].apply(_obj,_pars);
    }

    function __class(_cn,_class) {
        var _src = {}, _parents = [];
		for (var c=2;c<arguments.length;c++) {
            _src = arguments[c];
            if (typeof _src !== "object"){
                if (typeof _src === "string" && typeof window[_src] === "object")
                    _src = window[_src];
                else continue;
            }
			_src = __clone(_src);
			_parents.push(_src);
			for(var i in _src){
				if(typeof _class[i] === "undefined") _class[i] = _src[i];
			}
		}

		_class.__parents = _parents;
        window[_cn] = _class;
    }
