import React from 'react';
import {render} from 'react-dom';
import apiHelpers from './api-helpers';
import Reactable from 'reactable';
import SuperTable from './super-table.jsx';

var Table = Reactable.Table;

class AdminPanel extends React.Component {

  constructor(props) {
    super(props);
    apiHelpers.verifyToken().then((answer) => {
      if (!answer) {
        window.location.href = '/';
      }
    });

    this.state = {
      name: '',
      email: '',
      address: '',
      athletes: [],
      purchases: [],
      discounts: [],
      invites: [],
      displayData: []
    }
  }

  componentDidMount() {
    this.isLoggedIn();
    this.populateUserInfo();
  }

  isLoggedIn() {
    const loginDiv = document.getElementById('login');
    const loginButton = document.getElementById('login-button');
    apiHelpers.verifyToken().then((answer) => {
      if (answer) {
        loginButton.innerHTML = 'My Account';
        loginButton.onclick = () => {
          window.location.href = '/account';
        }
      } else {
        loginButton.onclick = () => {
          loginDiv.style.opacity = 1;
          loginDiv.style.visibility = 'visible';
        };
      }
    });
  }

  populateUserInfo() {
    apiHelpers.getUserData()
    .then((response) => {
      console.log(response.data);
      if (!!response.data) {
        if (response.data.ok) {
          if (response.data.user.isAdmin) {
            this.setState({
              name: response.data.user.name || 'None Entered',
              email: response.data.user.email,
              address: response.data.user.address || {line1: 'None Entered'},
              isAdmin: response.data.user.isAdmin,
              athletes: response.data.athletes || [],
              purchases: response.data.purchases || [],
              discounts: response.data.discounts || [],
              invites: response.data.invites || [],
              displayData: this.combineData(response.data.athletes, response.data.purchases)
            });
          } else {
            window.location.href = '/';
          }
        } else {
          window.location.href = '/';
        }
      }
    })
  }

  combineData(athletes, purchases) {
    let returnArr = [];
    for (let i = 0; i < purchases.length; i++) {
      let athleteId = purchases[i].athleteId;
      for (let j = 0; j < athletes.length; j++) {
        if (athletes[j].id === athleteId) {
          let purchaseClone = JSON.parse(JSON.stringify(purchases[i]));
          let athleteClone = JSON.parse(JSON.stringify(athletes[j]));
          for (let key in athleteClone) {
            if (!(purchaseClone.hasOwnProperty(key))) {
              purchaseClone[key] = athleteClone[key];
            }
          }
          returnArr.push(purchaseClone);
        }
      }
    }
    return returnArr;
  }

  addCode(e) {
    e.preventDefault();
    let amount = this.refs.percentInput.value;
    amount = parseInt(amount) / 100;
    let description = this.refs.descInput.value;
    if (!!amount && !!description) {
      apiHelpers.createDiscount(description, amount)
      .then((response) => {
        window.location.reload();
      });
    }
  }

  addInvite(e) {
    e.preventDefault();
    let level = this.refs.levelInput.value;
    let description = this.refs.inviteDescInput.value;

    if (!(level <= 5 && level >= 3)) {
      alert('Level must be 3, 4, or 5');
    } else {
      if (!!level && !!description) {
        apiHelpers.createInvite(description, level)
        .then((response) => {
          window.location.reload();
        });
      }
    }
  }

        // <div className="row">
        //   <div className="col-xs-12">
        //     <div className="account-panel-box">
        //       <div className="title-box">
        //         <span className="title">Purchases</span>
        //       </div>
        //       <div className="body-box">
        //         <Table data={purchases} sortable={true}/>
        //       </div>
        //     </div>
        //   </div>
        // </div>


  render() {
    let purchases = this.state.purchases;
    let athletes = this.state.athletes;
    console.log(athletes);
      return (
      <section id="my-account">

      <p className="subsection-header"><span className="red-text">Admin</span> Panel</p>

        <div className="row">
          <div className="col-xs-12">
            <div className="account-panel-box">
              <div className="title-box">
                <span className="title">Athletes</span>
              </div>
              <div className="body-box">
                <SuperTable data={this.state.displayData} shownColumns={['firstName', 'lastName', 'facility', 'group', 'quarter', 'emergencyContactMDN']}/>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xs-12 col-md-6">
            <div className="account-panel-box">
              <div className="title-box">
                <span className="title">Discount Codes</span>
              </div>
              <div className="body-box">
                <Discounts discounts={this.state.discounts}/>
                  <form id="addCode" className="form-labels-on-top" onSubmit={this.addCode.bind(this)}>
                      <div className="row">
                        <div className="col-xs-12 col-md-6">
                          <div className="form-row">
                            <label>
                              <span className='required'>Description</span>
                              <input type="text" name="description" ref="descInput" style={{width: '100%'}}/>
                            </label>
                          </div>
                        </div>

                        <div className="col-xs-12 col-md-6">
                          <div className="form-row">
                            <label>
                              <span className='required'>Percentage (0-100)</span>
                              <input type="text" name="amount" ref="percentInput" style={{width: '100%'}}/>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="form-row" >
                          <button type="submit">Add Code</button>
                      </div>

                  </form>
              </div>
            </div>
          </div>
          <div className="col-xs-12 col-md-6">
            <div className="account-panel-box">
              <div className="title-box">
                <span className="title">Invite Codes</span>
              </div>
              <div className="body-box">
                <Invites invites={this.state.invites}/>
                  <form id="addInvite" className="form-labels-on-top" onSubmit={this.addInvite.bind(this)}>
                      <div className="row">
                        <div className="col-xs-12 col-md-6">
                          <div className="form-row">
                            <label>
                              <span className='required'>Description</span>
                              <input type="text" name="description" ref="inviteDescInput" style={{width: '100%'}}/>
                            </label>
                          </div>
                        </div>

                        <div className="col-xs-12 col-md-6">
                          <div className="form-row">
                            <label>
                              <span className='required'>Level (3-5)</span>
                              <input type="text" name="amount" ref="levelInput" style={{width: '100%'}}/>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="form-row" >
                          <button type="submit">Add Code</button>
                      </div>

                  </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

class Purchases extends React.Component {
  constructor(props) {
    super(props);

    console.log(this.props)
  }

  getAthlete(id) {
    for (let i = 0; i < this.props.athletes.length; i++) {
      if (this.props.athletes[i].id === id) {
        return (this.props.athletes[i].firstName + ' ' + this.props.athletes[i].lastName).toUpperCase();
      }
    }
  }

  render() {
    let getAthlete = this.getAthlete.bind(this);
    if (this.props.purchases.length === 0) {
      return (<p> None to show </p>);
    } else {
      return (
        <table className="purchases-table">
          <tbody>
            <tr>
              <th>Quarter</th>
              <th>Group</th>
              <th>Facility</th>
              <th>Athlete</th>
            </tr>
            {this.props.purchases.map((purchase) => {
              return (
                <tr key={purchase.id}>
                  <td>
                    {purchase.quarter.toUpperCase()}
                  </td>
                  <td>
                    {purchase.group.toUpperCase()}
                  </td>
                  <td>
                    {purchase.facility.toUpperCase()}
                  </td>
                  <td>
                    {getAthlete(purchase.athleteId)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
  }
}

class Discounts extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {

    if (this.props.discounts.length === 0) {
      return (<p> None to show </p>);
    } else {
      return (
        <table className="purchases-table">
          <tbody>
            <tr>
              <th>Description</th>
              <th>Code</th>
              <th>Amount</th>
            </tr>
            {this.props.discounts.map((discount) => {
              return (
                <tr key={discount.id}>
                  <td>
                    {discount.type}
                  </td>
                  <td>
                    {discount.code}
                  </td>
                  <td>
                    {discount.amount * 100}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
  }
}

class Invites extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {

    if (this.props.invites.length === 0) {
      return (<p> None to show </p>);
    } else {
      return (
        <table className="purchases-table">
          <tbody>
            <tr>
              <th>Description</th>
              <th>Code</th>
              <th>Level</th>
            </tr>
            {this.props.invites.map((invite) => {
              return (
                <tr key={invite.id}>
                  <td>
                    {invite.type}
                  </td>
                  <td>
                    {invite.code}
                  </td>
                  <td>
                    {invite.level}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
  }
}

export default AdminPanel;