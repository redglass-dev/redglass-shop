export default class Helpers {

    public static buildFilter(filterList: any[]) {
        return `filter=${JSON.stringify(this.encodeFilter(filterList))}`
    }

    public static encodeFilter(filterList: any[]) {
        for(let key in filterList) {
            if(typeof filterList[key] === 'string') {
                filterList[key] = filterList[key].replace(/\&/g, "%26")
            } else if (Array.isArray(filterList[key])) {
                filterList[key] = this.encodeFilter(filterList[key])
            }
        }

        return filterList
    }

    public static getOptionsData(options: any) {
        const keys = [
            'filter',
            'group',
            'groupSummary',
            'parentIds',
            'requireGroupCount',
            'requireTotalCount',
            'searchExpr',
            'searchOperation',
            'searchValue',
            'select',
            'sort',
            'skip',
            'take',
            'totalSummary',
            'userData',
            'join'
        ]

        return  keys.reduce((subset, key) => {
            if(key in options) {
                subset[key] = JSON.stringify(options[key])
            }

            return subset;
        }, {} as Record<string, any>);
    }

    public static createQueryString(options: any) {
       // console.log(options)
        options = Helpers.getOptionsData(options);
        //console.log(options)
        return Object.keys(options).map(key => `${key}=${options[key]}`).join('&');
    }

    public static buildFilters(filters: string|any[], comparer: string = "=") {
        if(Array.isArray(filters)) return filters;

        if(filters.indexOf(',') < 0) {
            const [key, value] = filters.split(':')
            const parsedValue = this.parseValue(value, comparer)
            return this.encodeFilter([ this.parseKey(key), parsedValue.comparer, parsedValue.value ]);
        }

        let results = filters.split(',').map(filter => {
            const [key, value] = filter.split(':')
            const parsedValue = this.parseValue(value, comparer)
            return [ this.parseKey(key), parsedValue.comparer, parsedValue.value ]
        })

        let results2:any[] = [results[0]]
        for(let i = 1; i < results.length; i++) {
            results2.push("and", results[i])
        }

        console.log(JSON.stringify(results2))
        return this.encodeFilter(results2)
    }

    public static buildJoin(joins: string|any[]) {
        if(Array.isArray(joins)) return joins;

        if(joins.indexOf(',') < 0) {
            const [key, value] = joins.split(':')
            const parsedJoin = this.parseJoin(key);
            return parsedJoin !== null ? [parsedJoin] : [];
        }

        return joins.split(',').map(join => {
            const [key, value] = join.split(':')
            return this.parseJoin(key)
        }).filter((join) => join !== null);
    }

    private static parseValue(value: string, comparer: string = "=") {
        if(value.indexOf('|') < 0) {
            return {comparer: comparer, value: value};
        }

        const values = value.split('|')
        return {comparer: "in", value: values};
    }

    private static parseKey(key: string) {
        if(key.indexOf('|') < 0) {
            return key;
        }

        const keys = key.split('|');
        return `${keys[1]}.${keys[0]}`
    }

    private static parseJoin(join: string) {
        if(join.indexOf('|') < 0) {
            return null;
        }

        const keys = join.split('|');
        // join = [{
        //     joinType: 'join',
        //     table: 'acc_stock_characteristic_groups_stock_groups',
        //     localKey: 'guid',
        //     foreignKey: 'stockCharacteristicGroupGuid',
        // }]
        return {
            joinType: 'join',
            table: keys[1],
            localKey: keys[2],
            foreignKey: keys[3],
        }
    }
}
