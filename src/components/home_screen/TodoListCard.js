import React from 'react';
import { Button } from 'react-materialize';

class TodoListCard extends React.Component {

    render() {
        const { todoList } = this.props;
        console.log("TodoListCard, todoList.id: " + todoList.id);
        return (
            <div className="card z-depth-2 rounded grey lighten-4 todo-list-link hoverable">
                <div className="card-content grey-text text-darken-4 item_card">
                    <div className="card-title">
                        {todoList.name}
                        <h4 className="btn-floating btn-small waves-effect waves-light red accent-2 modal-trigger"
                            href="#modal1" onClick={() => this.props.selectWireframe(todoList.id)}>X</h4>
                    </div>

                </div>
            </div>
        );
    }
}
export default TodoListCard;