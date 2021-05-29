
import React from 'react'

let filters = ['Age 18+','Age 45+','COVISHIELD','COVAXIN','Free','Paid']
export default function filter({handleFilterChange,propfilters=[]}){
    const [filter, setFilter] = React.useState(propfilters);
    function handleFilterselection(val){

        let index = filter.indexOf(val);
        let finalfilter = [...filter]
         if(index > -1){
             finalfilter.splice(index, 1);           
         }else{ 
             finalfilter.push(val)
         }
         setFilter(finalfilter)
         handleFilterChange(finalfilter)
    }
    
    return (
      <div className="row" style={{marginTop:'20px'}}>
        <div className="col-sm-offset-3 col-sm-6 col-xs-12">
          {filters.map((a) => (
            <input
              id={'filter'}
              value={a}
              type="button"
              style={{ margin: "5px" ,outlineStyle:'none'}}
              className={
                "btn " + (filter.includes(a) ? "btn-info" : "btn-default")
              }
              onClick={(e) => {
                  e.preventDefault()
                  handleFilterselection(a)
                }}
            ></input>
          ))}
        </div>
      </div>
    );
}