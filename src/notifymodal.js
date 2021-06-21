import React from "react";
import axios from "axios";
export default function NotifyModal({ isOpen = false, pincode, handleClose }) {
  const [payload, setPayload] = React.useState({
    pincode,
  });
  const [res, setRes] = React.useState({});
  function handleInputChange(e) {
    setPayload({ ...payload, [e.target.name]: e.target.value });
  }
  React.useEffect(()=>{
    setPayload({...payload,pincode})
  },[pincode])
  async function handleSubmit() {
    try {
      setRes({});
      let res = await axios.post("/subscribe", payload);
      console.log("res", res);
      setRes(res)
    } catch (e) {
      console.error(e);
    }
  }
  return (
    <div
      className={"modal fade" + (isOpen ? " in" : "")}
      role="dialog"
      style={{ display: isOpen ? "block" : "none" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              onClick={handleClose}
            >
              &times;
            </button>
            <h4 className="modal-title">Notify when slot available</h4>
          </div>
          <div className="modal-body">
            {res.status ? (
              <div
                className={
                  "alert alert-dismissible " +
                  (res.status == 200 ? "alert-success" : "alert-danger")
                }
              >
                <a
                  href="#"
                  className="close"
                  data-dismiss="alert"
                  aria-label="close"
                  onClick={e=>setRes({})}
                >
                  &times;
                </a>
                {res.data.message}
                
              </div>
            ) : null}
            <form>
              <div className="form-group">
                <label>Name :</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={payload.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Email address:</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={payload.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Pincode:</label>
                <input
                  type="text"
                  className="form-control"
                  value={payload.pincode}
                  onChange={handleInputChange}
                  name="pincode"
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-default"
              data-dismiss="modal"
              onClick={handleClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-info"
              onClick={handleSubmit}
            >
              Notify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
