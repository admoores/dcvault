import React from 'react'
import apiHelpers from './api-helpers'

class AccountPanel extends React.Component {
  constructor (props) {
    super(props)
    apiHelpers.verifyToken().then((answer) => {
      if (!answer) {
        window.location.href = '/'
      }
    })

    this.state = {
      name: '',
      email: '',
      address: '',
      athletes: [],
      purchases: [],
      discounts: [],
      invites: [],
      isEditing: false,
      errorText: '',
      statusText: ''
    }
  }

  componentDidMount () {
    this.isLoggedIn()
    this.populateUserInfo()
  }

  isLoggedIn () {
    const loginDiv = document.getElementById('login')
    const loginButton = document.getElementById('login-button')
    apiHelpers.verifyToken().then((answer) => {
      if (answer) {
        loginButton.innerHTML = 'My Account'
        loginButton.onclick = () => {
          window.location.href = '/account'
        }
      } else {
        loginButton.onclick = () => {
          loginDiv.style.opacity = 1
          loginDiv.style.visibility = 'visible'
        }
      }
    })
  }

  editUserInfo () {
    let current = this.state.isEditing
    this.setState({
      isEditing: !current
    })
  }

  updateUserInfo () {
    this.setState({
      errorText: '',
      statusText: ''
    })

    let password = this.refs.passwordChange.value
    let passwordConf = this.refs.passwordChangeConfirm.value
    let name = this.refs.nameChange.value

    if (password !== passwordConf) {
      this.setState({
        errorText: 'New passwords do not match'
      })
    } else {
      apiHelpers.editUserInfo(name, password)
      .then((response) => {
        if (!response.data.ok) {
          this.setState({
            errorText: 'An error has occurred. Please try again later'
          })
        } else {
          this.setState({
            statusText: 'Your account has been updated. You will be logged out in 10 seconds. Please log in again for the changes to take effect'
          })
          setTimeout(this.logout.bind(this), 10000)
        }
      })
    }
  }

  populateUserInfo () {
    apiHelpers.getUserData()
    .then((response) => {
      console.log(response.data)
      if (response.data) {
        if (response.data.ok) {
          this.setState({
            user: response.data.user || {},
            name: response.data.user.name || 'None Entered',
            email: response.data.user.email,
            address: response.data.user.address || {line1: 'None Entered'},
            isAdmin: response.data.user.isAdmin,
            athletes: response.data.athletes || [],
            purchases: response.data.purchases || [],
            discounts: response.data.discounts || [],
            invites: response.data.invites || []
          })
        } else {
          window.location.href = '/'
        }
      }
    })
  }

  logout () {
    window.localStorage.removeItem('token')
    window.location.href = '/'
  }

  render () {
    let purchases = this.state.purchases
    let athletes = this.state.athletes
    let user = this.state.user
    let errorContainer = ''
    let statusContainer = ''
    if (this.state.errorText.length > 0) {
      errorContainer = (
        <div className='error-container'>
          <p>{this.state.errorText}</p>
        </div>
      )
    }
    if (this.state.statusText.length > 0) {
      statusContainer = (
        <div className='status-container'>
          <p>{this.state.statusText}</p>
        </div>
      )
    }
    return (
      <section id='my-account'>
        <div className='row'>
          <div className='col-xs-12 col-md-6'>
            <p className='subsection-header'><span className='red-text'>Athlete</span> Profile</p>
            <div className='account-panel-box'>
              <div className='title-box'>
                <span className='title'>My Purchases</span>
              </div>
              <div className='body-box'>
                <Purchases purchases={purchases} athletes={athletes} user={user} />
              </div>
            </div>
            <div className='account-panel-box'>
              <div className='title-box'>
                <span className='title'>Resources</span>
              </div>
              <div className='body-box'>
                <ul>
                  <li><a href='/files/quarterly-conditioning.pdf' download>Quarterly Conditioning Guide</a></li>
                  <li><a href='/files/parking-pass.pdf' download>DCV Parking Pass</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className='col-xs-12 col-md-6'>
            <p className='subsection-header'>Account <span className='red-text'>Management</span></p>

            <div className='account-panel-box'>
              <div className='title-box'>
                <span className='title'>My Account Details</span>
                <span style={{display: this.state.isEditing ? 'none' : 'inline-block'}} className='glyphicon glyphicon-pencil edit-button' onClick={this.editUserInfo.bind(this)} />
                <span style={{display: this.state.isEditing ? 'inline-block' : 'none'}} className='glyphicon glyphicon-remove edit-button' onClick={this.editUserInfo.bind(this)} />
              </div>
              <div className='body-box'>
                <p><span className='item-name'>Name:</span>
                  <span style={{display: this.state.isEditing ? 'none' : 'inline-block'}}>{this.state.name}</span>
                  <input ref='nameChange' style={{display: this.state.isEditing ? 'inline-block' : 'none'}} />
                </p>
                <p><span className='item-name'>Email:</span>{this.state.email}</p>
                <p><span className='item-name'>Password:</span>
                  <span style={{display: this.state.isEditing ? 'none' : 'inline-block'}}>********</span>
                  <input ref='passwordChange' style={{display: this.state.isEditing ? 'inline-block' : 'none'}} type='password' />
                  <span style={{display: this.state.isEditing ? 'block' : 'none'}} />
                  <span className='item-name' style={{display: this.state.isEditing ? 'inline-block' : 'none'}}>Confirm:</span>
                  <input ref='passwordChangeConfirm' style={{display: this.state.isEditing ? 'inline-block' : 'none'}} type='password' />
                </p>

                <div className='red-button' style={{display: this.state.isEditing ? 'block' : 'none'}} onClick={this.updateUserInfo.bind(this)}>
                  <span className='button-text'>Update</span>
                </div>
                {errorContainer}
                {statusContainer}

                <p style={{display: this.state.isEditing ? 'none' : 'block'}}>
                  To edit your account information, click the pen icon in the top right
                </p>

                <div style={{display: this.state.isEditing ? 'none' : 'block'}} className='red-button' onClick={this.logout.bind(this)}>
                  <span className='button-text'>Log Out</span>
                </div>
              </div>
            </div>
            {this.state.isAdmin ? (
              <div className='account-panel-box'>
                <div className='title-box'>
                  <span className='title'>Admin Panel</span>
                </div>
                <div className='body-box'>
                  <p>
                    It appears you are an administrator. To view your Administrator Panel, click below.
                  </p>
                  <div className='red-button' onClick={() => { window.location.href = '/admin' }}>
                    <span className='button-text'>Go</span>
                  </div>
                </div>
              </div>
            ) : ''}
          </div>
        </div>
      </section>
    )
  }
}

class Purchases extends React.Component {
  constructor (props) {
    super(props)

    console.log(this.props)
  }

  getAthlete (id) {
    for (let i = 0; i < this.props.athletes.length; i++) {
      if (this.props.athletes[i].id === id) {
        return (this.props.athletes[i].firstName + ' ' + this.props.athletes[i].lastName).toUpperCase()
      }
    }
  }

  render () {
    let getAthlete = this.getAthlete.bind(this)
    if (this.props.purchases.length === 0) {
      return (<p> None to show </p>)
    } else {
      return (
        <table className='purchases-table'>
          <tbody>
            <tr>
              <th>Quarter</th>
              <th>Group</th>
              <th>Facility</th>
              <th>Athlete</th>
            </tr>
            {this.props.purchases.map((purchase) => {
              if (purchase.userId === this.props.user.id) {
                return (
                  <tr key={purchase.id}>
                    <td>
                      {purchase.quarter.toUpperCase()}
                    </td>
                    <td>
                      {purchase.group === 'youth-adult' ? ('YOUTH OR ADULT') : purchase.group.toUpperCase()}
                    </td>
                    <td>
                      {purchase.facility.toUpperCase()}
                    </td>
                    <td>
                      {getAthlete(purchase.athleteId)}
                    </td>
                  </tr>
                )
              }
            })}
          </tbody>
        </table>
      )
    }
  }
}

export default AccountPanel
