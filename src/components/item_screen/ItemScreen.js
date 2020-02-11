import React, { Component } from 'react';
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux';
import { compose } from 'redux';
import { firestoreConnect } from 'react-redux-firebase';
import { getFirestore } from 'redux-firestore';
import { DatePicker } from 'react-materialize';

class ItemScreen extends Component {

    itemData = {
        assigned_to: "Unknown",
        completed: false,
        description: "Do Something",
        due_date: "2019-12-25",
        key: parseInt(this.props.itemid)
    };

    setItemData = (data) => {
        this.itemData = data;
        console.log("ItemData is: ", this.itemData);
    }

    dateChange = (date) => {
        let time = date.target.value;
        let newTime = (new Date(time.getTime() - (time.getTimezoneOffset() * 60000)).toISOString().split("T")[0]).toString();
        console.log("Changing date to: ", newTime);
        this.itemData.due_date = newTime;
    }

    descriptionChange = (e) => {
        this.itemData.description = e.target.value;
        console.log(this.itemData.description);
    }

    assignedToChange = (e) => {
        this.itemData.assigned_to = e.target.value;
        console.log(this.itemData.assigned_to);
    }

    toggleCompletion = () => {
        this.itemData.completed = !this.itemData.completed;
        console.log(this.itemData.completed);
    }

    onSubmit = () => {
        console.log("ON SUBMIT");
        let items = JSON.parse(JSON.stringify(this.props.todoList.items));
        let pos = this.props.itemid
        items[pos] = this.itemData;

        console.log(items);
        let fireStore = getFirestore();
        fireStore.collection("todoLists").doc(this.props.todoList.id).update({ items: items });
        this.goBack();
    }

    goBack = () => {
        this.props.history.goBack();
    }

    render() {
        const auth = this.props.auth;
        let todoList = this.props.todoList;
        console.log("Rendering itemScreen");

        if (!auth.uid)
            return <Redirect to="/" />;

        if (!todoList)
            return <React.Fragment />

        let todoItem;
        let screenTitle;
        if (!this.props.todoItem) {
            console.log("todoItem is false");
            todoItem = {
                assigned_to: "Unknown",
                completed: false,
                description: "Do Something",
                due_date: "2019-12-25",
                key: parseInt(this.props.itemid),
            }
            screenTitle = "Add New Item";
        }
        else {
            console.log("todoItem is true");
            todoItem = this.props.todoList.items[this.props.itemid];
            this.setItemData(todoItem);
            screenTitle = "Edit Item"
        }

        let date = new Date(todoItem.due_date);
        date.setDate(date.getUTCDate());

        return (
            <div className="grey lighten-2 z-depth-2" style={{ paddingTop: '20px', paddingBottom: '20px', borderRadius: '0 0 10px 10px' }}>
                <div className="padding_20">
                    <h4>{screenTitle}</h4>
                    <div className="row">
                        <div className="input-field col s6">
                            <label className="active text_16" htmlFor="description">Description</label>
                            <input className="text_20" type="text" name="description" id="description"
                                defaultValue={todoItem.description} onChange={this.descriptionChange} />
                        </div>
                        <div className="input-field col s6">
                            <label className="active text_16" htmlFor="assigned_to">Assigned To</label>
                            <input className="text_20" type="text" name="assigned_to" id="assigned_to"
                                defaultValue={todoItem.assigned_to} onChange={this.assignedToChange} />
                        </div>
                        <div className="col s6">
                            <label htmlFor="datepicker">Date</label>
                            <div name="datepicker">
                                <DatePicker options={{ autoClose: true, defaultDate: date, setDefaultDate: true }}
                                    onChange={(newDate) => {
                                        this.dateChange({
                                            target: {
                                                id: "myDate",
                                                value: newDate
                                            }
                                        })
                                    }} />
                            </div>
                        </div>
                        <div className="col s6">
                            <label>
                                <input onChange={this.toggleCompletion} type="checkbox" className="filled-in" defaultChecked={todoItem.completed} />
                                <span className="grey-text text-darken-3">Completed</span>
                            </label>
                        </div>
                        <div style={{ paddingTop: '30px' }} className="col s2 offset-s1 center-align">
                            <a onClick={this.onSubmit} className="waves-effect waves-light btn-large purple lighten-2 hoverable rounded">
                                <i className="material-icons right">send</i>Submit
                            </a>
                        </div>
                        <div style={{ paddingTop: '30px' }} className="col s2 center-align">
                            <a onClick={this.goBack} className="waves-effect waves-light btn-large red accent-2 hoverable rounded">
                                <i className="material-icons right">keyboard_return</i>Cancel
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    const { id } = ownProps.match.params;
    const { todoLists } = state.firestore.data;
    let { itemid } = ownProps.match.params;
    const todoList = todoLists ? todoLists[id] : null;

    if (todoList)
        todoList.id = id;

    let todoItem = null;
    if (todoList) {
        todoItem = todoList.items[itemid];
    }

    return {
        todoItem,
        todoList,
        itemid,
        auth: state.firebase.auth,
    };
};

export default compose(
    connect(mapStateToProps),
    firestoreConnect([
        { collection: 'todoLists' },
    ]),
)(ItemScreen);