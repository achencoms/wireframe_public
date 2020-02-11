import React from 'react'
import { connect } from 'react-redux';
import todoJson from './TestTodoListData.json'
import { getFirestore } from 'redux-firestore';

class DatabaseTester extends React.Component {

    // NOTE, BY KEEPING THE DATABASE PUBLIC YOU CAN
    // DO THIS ANY TIME YOU LIKE WITHOUT HAVING
    // TO LOG IN
    handleClear = () => {
        const fireStore = getFirestore();
        fireStore.collection('todoLists').get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                console.log("deleting " + doc.id);
                fireStore.collection('todoLists').doc(doc.id).delete();
            })
        });
    }

    handleReset = () => {
        const fireStore = getFirestore();
        todoJson.todoLists.forEach(todoListJson => {
            console.log(todoListJson.draggables);
            fireStore.collection('todoLists').add({
                name: todoListJson.name,
                owner: todoListJson.owner,
                draggables: todoListJson.draggables,
                time: Date.now(),
                height: todoListJson.height,
                owner: todoListJson.owner,
                scale: todoListJson.scale,
                width: todoListJson.width,
            }).then(() => {
                console.log("DATABASE RESET");
            }).catch((err) => {
                console.log(err);
            });
        });
    }

    render() {
        getFirestore().collection('users').doc(this.props.auth.uid).get().then((data) => {
            if (!data.data().isAdmin) this.props.history.push('/');
        });

        return (
            <div>
                <button onClick={this.handleClear}>Clear Database</button>
                <button onClick={this.handleReset}>Reset Database</button>
            </div >)
    }
}

const mapStateToProps = function (state) {
    return {
        auth: state.firebase.auth,
        firebase: state.firebase
    };
}

export default connect(mapStateToProps)(DatabaseTester);