import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import ItemCard from './ItemCard';
import { firestoreConnect } from 'react-redux-firebase';
import { Link } from 'react-router-dom';

class ItemsList extends React.Component {
    render() {
        console.log("Rendering itemsList");
        let todoList = this.props.todoList
        let items = todoList.items;

        return (
            <div className="todo-lists section grey lighten-1">
                {items && items.map(function (item) {
                    item.id = item.key;
                    return (
                        <Link key={item.key} to={{
                            pathname: '/todoList/' + todoList.id + '/item/' + item.key,
                            list: { item }
                        }} >
                            <ItemCard todoList={todoList} item={item} key={item.key} />
                        </Link>
                    );
                })
                }
                <div onClick={this.props.addItem} className="card item_card z-depth-2 hoverable rounded center-align grey-text text-darken-3">
                    <div className="card-content center-align"><
                        i style={{ verticalAlign: "middle", fontSize: '40px' }} className="material-icons">add</i>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const todoList = ownProps.todoList;
    return {
        todoList,
        auth: state.firebase.auth,
    };
};

export default compose(
    connect(mapStateToProps),
    firestoreConnect([
        { collection: 'todoLists' },
    ]),
)(ItemsList);