import React from "react";
import client from "./client";
import moment from "moment";
import _ from "underscore";
export default function Login({ handleCallback }) {
  const [states, setStates] = React.useState([]);
  const [sessions, setSessions] = React.useState([]);
  const [districts, setDistricts] = React.useState([]);
  const [centers, setCenters] = React.useState([]);

  const [state, setState] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [pincode, setPincode] = React.useState("");
  const [searchBy, setSearchBy] = React.useState("pincode");
  const [date, setDate] = React.useState(moment().format("YYYY-MM-DD"));
  const [result, setResult] = React.useState(false);
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
      setCenters(res.data.centers || []);
    } catch (e) {
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
  React.useEffect(() => {
    getStates();
  }, []);
  React.useEffect(() => {
    getDistricts();
  }, [state]);
  React.useEffect(() => {
    findAppointments();
  }, [date]);
  function addDay(days) {
    return moment(date).add(days, "days").format("DD MMM YYYY");
  }
  async function handleSubmit(e) {
    e.preventDefault();
    findAppointments();
    // handleCallback(username, password);
  }
  return (
    <div className="row">
      <div className="col-sm-6 col-xs-12 col-sm-offset-3">
        <form onSubmit={handleSubmit}>
          <div class="form-group">
            <input
              type="radio"
              value="pincode"
              checked={searchBy === "pincode"}
              onChange={(e) => setSearchBy("pincode")}
            />{" "}
            Search By Pincode
            <input
              type="radio"
              value="district"
              style={{ marginLeft: "10px" }}
              checked={searchBy === "district"}
              onChange={(e) => setSearchBy("district")}
            />{" "}
            Search By District
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

          <button type="submit" class="btn btn-success">
            Search
          </button>
        </form>
      </div>
      <div className="col-sm-12">
        <div style={{ marginTop: "10px" }}>
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

          <table class="table table-striped">
            <thead>
              <tr>
                <th></th>
                {[...Array(7)].map((e, i) => (
                  <th key={i}>{addDay(i)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {centers.map((center) => (
                <tr>
                  <td style={{ width: "100px" }}>
                    <b>
                      {center.name} &nbsp;
                      {center.fee_type === "Free" ? null : (
                        <span class="label label-primary">PAID</span>
                      )}
                    </b>
                    <br />
                    {center.address},{center.block_name},{center.district_name},
                    {center.state_name} - {center.pincode}
                  </td>
                  {[...Array(7)].map((e, i) => {
                    let obj = _.findWhere(center.sessions, {
                      date: moment(date).add(i, "days").format("DD-MM-YYYY")
                    });
                    if (!obj) {
                      return (
                        <td>
                          <span className="badge">NA</span>
                        </td>
                      );
                    }
                    return (
                      <td key={i}>
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
                            <span style={{ color: "blue" }}>{obj.vaccine}</span>
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
          {result && !centers.length ? (
            <center>
              <b>No Vaccination Center Available </b>
            </center>
          ) : null}
        </div>{" "}
      </div>
    </div>
  );
}
