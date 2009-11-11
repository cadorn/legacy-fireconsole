
rep = extend(master.rep, {
    
    _appender: master.getAppender('OpenGroup'),

    tag: TAG("$objects|_getValue|_getTag", {
        object: "$objects|_getValue"
    }),

    _getTag: function(object)
    {
        return master.reps.Text.tag;
    },
    
    _getValue: function(object)
    {
        return object[0].Label;
    }
    
});
