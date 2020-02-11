import React from 'react';
import { Button, Icon } from 'react-materialize';
import { getFirestore } from 'redux-firestore';

class ItemCard extends React.Component {
    moveUp = (e) => {
        e.stopPropagation();
        e.preventDefault();
        let { item } = this.props;
        if (item.id > 0) {
            console.log("Moving item up");
            this.swapItems(item.id, (item.id - 1));
        }
    }

    moveDown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        let { item } = this.props;
        let { todoList } = this.props;
        let length = todoList.items.length;
        if (item.id < (length - 1)) {
            console.log("Moving item down");
            this.swapItems(item.id, (item.id + 1));
        }
    }

    swapItems = (oldIndex, newIndex) => {
        let { todoList } = this.props;
        let items = todoList.items;
        let temp = items[oldIndex];
        items[oldIndex] = items[newIndex];
        items[newIndex] = temp;

        this.updateFirestoreList(items);
    }

    removeItem = (e) => {
        e.stopPropagation();
        e.preventDefault();
        let { todoList } = this.props;
        let { item } = this.props;
        let items = todoList.items;
        items.splice(item.id, 1);

        this.updateFirestoreList(items);
    }

    updateKeys = (list) => {
        for (let i = 0; i < list.length; i++) {
            list[i].key = i;
            list[i].id = i;
        }
        return list
    }

    updateFirestoreList = (list) => {
        let updatedList = this.updateKeys(list)
        let fireStore = getFirestore();
        fireStore.collection("todoLists").doc(this.props.todoList.id).update({ items: updatedList })
    }

    render() {
        let { item } = this.props;
        let { todoList } = this.props;

        return (
            <div className="card z-depth-2 grey lighten-4 hoverable rounded item_card">
                <div className="card-content grey-text text-darken-3 item_card">
                    <div className="row margin_bottom_-10">
                        <h5 className="col s12" style={{ marginBottom: '20px' }}><b>{item.description}</b></h5>
                        <span className="col s3 left-align text_20">Assigned to: <b>{item.assigned_to}</b> </span>
                        <span className="col s3 center-align text_20">{item.due_date}</span>
                        <span className={item.completed ? "col s3 right-align green-text text_20" : "col s3 right-align red-text text_20"}>
                            {item.completed ? "Completed" : "Pending"}
                        </span>
                        <span className="col s1 offset-s2">
                            <Button icon={<Icon children='keyboard_arrow_left' />} floating fab={{ direction: 'left' }}
                                className="red accent-2" large style={{ position: 'relative' }}>
                                {item.id === 0 || item.id === todoList.items.length - 1 ?
                                    <span></span> :
                                    <Button floating icon={<Icon children='arrow_upward' />} className="purple accent-4" onClick={this.moveUp} />}
                                {item.id === todoList.items.length - 1 ?
                                    <Button floating icon={<Icon children='arrow_upward' />} className="purple accent-4" onClick={this.moveUp} /> :
                                    <Button floating icon={<Icon children='arrow_downward' />} className="teal accent-3" onClick={this.moveDown} />}
                                <Button floating icon={<Icon children='close' />} className="pink accent-2" onClick={this.removeItem} />
                            </Button>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}
export default ItemCard;