import React from "react";
import client from "./client";
import moment from "moment";
import _ from "underscore";
import Filter from "./filter";
import NotifyModal from './notifymodal'
import { useHistory, useLocation } from "react-router-dom";
function useQuery() {
  return new URLSearchParams(useLocation().search);
}
export default function Login() {
  const history = useHistory();
  
  let query = useQuery();
  const [states, setStates] = React.useState([]);
  const [filters, setFilters] = React.useState(query.get("filters")?window.decodeURIComponent(query.get('filters')).split(','):[]);
  const [districts, setDistricts] = React.useState([]);
  const [centers, setCenters] = React.useState([]);
  const [filteredcenters, setFilteredCenters] = React.useState([]);

  const [state, setState] = React.useState(query.get('state'));
  const [district, setDistrict] = React.useState(query.get("district"));
  const [pincode, setPincode] = React.useState(query.get('pincode'));
  const [searchBy, setSearchBy] = React.useState(query.get("searchBy") || 'pincode');
  const [date, setDate] = React.useState(moment().format("YYYY-MM-DD"));
  const [result, setResult] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [checked, setChecked] = React.useState(query.get('availableOnly') == 'yes'?true:false);
  async function getStates() {
    try {
      let res = await client.get("/admin/location/states");
      console.log("res", res);
      setStates(res.data.states || []);
    } catch (e) {}
  }
  async function getDistricts() {
    try {
      let res = await client.get(`/admin/location/districts/${state}`);
      console.log("res", res);
      setDistricts(res.data.districts || []);
    } catch (e) {}
  }
  async function findAppointments() {
    try {
      setResult(false);
      let selecteddate = moment(date).format("DD-MM-YYYY");
      let url =
        searchBy === "district"
          ? `/appointment/sessions/public/calendarByDistrict?district_id=${district}&date=${selecteddate}`
          : `/appointment/sessions/public/calendarByPin?pincode=${pincode}&date=${selecteddate}`;

      console.log("url", url);
      let res = await client.get(url);
      console.log("res", res);
      setResult(true);

      setCenters([...res.data.centers]);
      applyFilter();
    } catch (e) {
      console.error(e);
      setResult(false);
    }
  }
  function handleDateChange(action) {
    let updateddate = moment(date);
    if (action === "next") {
      updateddate = updateddate.add(7, "days");
    } else {
      updateddate = updateddate.add(-7, "days");
    }
    setDate(updateddate.format("YYYY-MM-DD"));
  }
  function handleSearchByChange(e) {
    if (e.target.checked) {
      setSearchBy(e.target.value);
    }
  }
  function applyFilter() {
    let data = [...centers]
    if (checked) {
      data = data.map((finalCenter) => {
        let center = { ...finalCenter };
        center.sessions = center.sessions.filter(
          (obj) => obj.available_capacity > 0
        );
        return center;
      });
    }
    if(!filters.length){
       setFilteredCenters(data.filter((obj) => obj.sessions.length));
      return 
    }
    
    
    data = data.filter((obj) => {
      if (filters.includes("Free") && filters.includes("Paid")) {
        return true;
      }
      if (filters.includes("Free")) {
        if (obj.fee_type == "Free") {
          return true;
        }
        return false;
      }
      if (filters.includes("Paid")) {
        if (obj.fee_type == "Paid") {
          return true;
        }
        return false;
      }
      return true;
    });

   let obj = data.map((finalCenter) => {
     let center = {...finalCenter}
     
     if (filters.includes("Age 18+") && filters.includes("Age 45+")) {
     } else if (filters.includes("Age 18+")) {
       center.sessions = center.sessions.filter(
         (session) => session.min_age_limit == 18
       );
     } else if (filters.includes("Age 45+")) {
       center.sessions = center.sessions.filter(
         (session) => session.min_age_limit == 45
       );
     }
     if (filters.includes("COVISHIELD") && filters.includes("COVAXIN")) {
     } else if (filters.includes("COVISHIELD")) {
       center.sessions = center.sessions.filter(
         (session) => session.vaccine === "COVISHIELD"
       );
     } else if (filters.includes("COVAXIN")) {
       center.sessions = center.sessions.filter(
         (session) => session.vaccine === "COVAXIN"
       );
     }
     return center;
   });
    
    setFilteredCenters(obj.filter(obj=>obj.sessions.length));
  }
  function handleNotify(){
     setIsOpen(true)
  }
  function handleClose(){
    setIsOpen(false)
  }
  React.useEffect(() => {
    getStates();
    // console.log('params',params)
  }, []);
  React.useEffect(() => {
    getDistricts();
  }, [state]);
  React.useEffect(() => {
    findAppointments();
  }, [date]);
  React.useEffect(() => {
    applyFilter();
  }, [filters,centers,checked]);
  React.useEffect(() => {
    const params = new URLSearchParams();
     if(district) params.append('district',district)
     if(pincode) params.append("pincode", pincode);
     if(state) params.append("state", state); 
    if (searchBy) params.append("searchBy", searchBy);
    if(filters) params.append('filters',filters) 
    params.append("availableOnly",checked?'yes':'no');
      history.push({ search: params.toString() });
     
     
  }, [district,pincode,state,searchBy,filters,checked]);
  function addDay(days) {
    return moment(date).add(days, "days").format("DD MMM YYYY");
  }
  async function handleSubmit(e) {
    e.preventDefault();
    findAppointments();
    // handleCallback(username, password);
  }
  function handleFilterChange(filter) {
    setFilters(filter);
    // applyFilter([...centers], filter);
  }
  return (
    <div className="">
      {result ? <span className="result-loaded"></span> : null}
      <NotifyModal
        isOpen={isOpen}
        handleClose={handleClose}
        pincode={pincode}
      />
      <div className="row">
        <div className="col-sm-6 col-xs-12 col-sm-offset-3">
          <h3>COWIN - Check your nearest vaccination center</h3>
          <label>Developed By: Sunil More</label>{" "}
          <a
            href="https://github.com/sunilmore690/cowin-vaccine"
            target="_blank"
          >
            Repo
          </a>
          <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
            <div class="form-group">
              <label
                style={{ fontWeight: searchBy === "pincode" ? 500 : 300 }}
              >
                <input
                  type="radio"
                  value="pincode"
                  checked={searchBy === "pincode"}
                  onChange={handleSearchByChange}
                />{" "}
                Search By Pincode
              </label>
              <label
                style={{ fontWeight: searchBy === "district" ? 500 : 300 }}
              >
                <input
                  type="radio"
                  value="district"
                  style={{ marginLeft: "10px" }}
                  checked={searchBy === "district"}
                  onChange={handleSearchByChange}
                />{" "}
                Search By District
              </label>
            </div>
            {searchBy === "district" ? (
              <React.Fragment>
                <div class="form-group">
                  <label for="email">State</label>
                  <select
                    type="text"
                    class="form-control"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  >
                    <option value="">--Select State--</option>
                    {states.map((state) => (
                      <option value={state.state_id}>{state.state_name}</option>
                    ))}
                  </select>
                </div>
                <div class="form-group">
                  <label for="email">District</label>
                  <select
                    type="text"
                    class="form-control"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  >
                    <option value="">--Select District--</option>
                    {districts.map((district) => (
                      <option value={district.district_id}>
                        {district.district_name}
                      </option>
                    ))}
                  </select>
                </div>
              </React.Fragment>
            ) : (
              <div class="form-group">
                <label for="email">Pincode</label>
                <input
                  type="text"
                  className="form-control"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
            )}

            <div class="form-group hide">
              <label for="email">Date</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-success"
              style={{ marginRight: "10px" }}
              disabled={
                searchBy === "pincode" ? (pincode || "").length !== 6 : false
              }
            >
              Search
            </button>
            {searchBy == "pincode" ? (
              <button
                className="btn btn-default"
                onClick={(e) => {
                  e.preventDefault();
                  handleNotify();
                }}
                disabled={(pincode || "").length !== 6}
              >
                Notify when slot avaible
              </button>
            ) : null}
            <label style={{ margin: "10px" }}>
              <input
                type="checkbox"
                defaultChecked={checked}
                onChange={() => setChecked(!checked)}
              />
              &nbsp;Only show availble slots
            </label>
          </form>
        </div>
      </div>

      <Filter handleFilterChange={handleFilterChange} propfilters={filters} />
      <div className="row">
        {result ? (
          <div style={{ marginTop: "10px" }} className="vaccine-result">
            <div>
              <span
                className="btn btn-link"
                onClick={(e) => handleDateChange("prev")}
              >
                {" "}
                Prev
              </span>
              <span
                className="btn btn-link pull-right"
                onClick={(e) => handleDateChange("next")}
              >
                Next{" "}
              </span>
            </div>
            <div className="table-responsive">
              <table class="table table-striped ">
                <thead>
                  <tr>
                    <th></th>
                    {[...Array(7)].map((e, i) => (
                      <th key={i}>{addDay(i)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredcenters.map((center) => (
                    <tr id={"abc" + center.center_id} className="got-result">
                      <td style={{ width: "100px" }}>
                        <b>
                          {center.name} &nbsp;
                          {center.fee_type === "Free" ? null : (
                            <span class="label label-primary">PAID</span>
                          )}
                        </b>
                        <br />
                        {center.address},{center.block_name},
                        {center.district_name},{center.state_name} -{" "}
                        {center.pincode}
                      </td>
                      {[...Array(7)].map((e, i) => {
                        let obj = _.findWhere(center.sessions, {
                          date: moment(date)
                            .add(i, "days")
                            .format("DD-MM-YYYY"),
                        });
                        if (!obj) {
                          return (
                            <td key={"session" + i}>
                              <span className="badge">NA</span>
                            </td>
                          );
                        }
                        return (
                          <td key={i + "session"}>
                            {obj.available_capacity == 0 ? (
                              <span className="label label-danger">Booked</span>
                            ) : (
                              <span className="label label-success">
                                {obj.available_capacity}
                              </span>
                            )}
                            <br />
                            <span style={{ colorName: "red" }}>
                              Age : {obj.min_age_limit}+
                            </span>
                            <br />
                            <span style={{ colorName: "darkgrey" }}>
                              {obj.vaccine === "COVISHIELD" ? (
                                <span style={{ color: "blue" }}>
                                  {obj.vaccine}
                                </span>
                              ) : (
                                <span style={{ color: "blueviolet" }}>
                                  {obj.vaccine}
                                </span>
                              )}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result && !filteredcenters.length ? (
              <center>
                <span className="no-result">
                  No Vaccination Center Available{" "}
                </span>
              </center>
            ) : null}
          </div>
        ) : null}{" "}
      </div>
    </div>
  );
}
