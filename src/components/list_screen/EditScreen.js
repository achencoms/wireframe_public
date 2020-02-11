import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { compose } from 'redux';
import ItemsList from './ItemsList.js'
import { firestoreConnect } from 'react-redux-firebase';
import { getFirestore } from 'redux-firestore';
import { Modal, TextInput, Button, Col, Row } from 'react-materialize';
import Draggable from 'react-draggable';
import ZoomIn from '../../zoom-in.png';
import ZoomOut from '../../zoom-out.png';
import { Rnd } from 'react-rnd';

class EditScreen extends Component {
    state = {
        name: '',
        owner: '',
        height: 0,
        width: 0,
        scale: 1.0,
    }

    changedTime = false;
    wireframe = this.props.todoList;

    updateTime = () => {
        console.log("updating time")
        let fireStore = getFirestore();
        fireStore.collection('todoLists').doc(this.props.todoList.id).update({ time: Date.now() })
    }

    saveWireframe = () => {
        let fireStore = getFirestore();
        let draggables = this.props.todoList.draggables;
        let name = this.props.todoList.name;
        fireStore.collection('todoLists').doc(this.props.todoList.id).update(this.props.todoList);
        console.log(JSON.stringify(this.props.todoList));
        this.props.history.goBack();
    }

    addDraggable = (type) => {
        let id = 0;
        let arr = this.props.todoList.draggables;
        if (arr.length > 0) id = arr.reduce((a, b) => a.id > b.id ? a : b).id + 1;
        let item = {
            type: type,
            x: 0,
            y: 0,
            id: id,
            height: 50,
            width: (type != 'container') ? 150 : 50,
            backgroundColor: (type === 'button') ? 'grey' : 'transparent',
            color: 'black',
            borderColor: 'black',
            borderWidth: (type === 'container' || type === "textfield") ? 1 : 0,
            borderRadius: (type === 'button') ? 8 : 0,
        }

        if (type != 'container') {
            item.text = 'New Control';
            item.fontSize = 14;
        }
        arr.push(item);
        this.setState({ draggables: arr });
    }

    zoomIn = (e) => {
        this.props.todoList.scale += .25;
        this.setState({ scale: this.props.todoList.scale });
    }

    zoomOut = (e) => {
        this.props.todoList.scale -= .25;
        this.setState({ scale: this.props.todoList.scale });
    }

    keyListener = (e) => {
        this.deleteDraggable(e);
        this.copyControl(e);
    }

    deleteDraggable = (e) => {
        if (e.keyCode === 46 && this.state.currentControl) {
            let arr = this.props.todoList.draggables;
            arr.splice(arr.findIndex((el) => el === this.state.currentControl), 1);
            this.setState({ currentControl: null });
        }
    }

    copyControl = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.state.currentControl && e.ctrlKey && e.keyCode == 68) {
            let arr = this.props.todoList.draggables;
            let copy = { ...this.state.currentControl };
            copy.x += 100;
            copy.y += 100;
            copy.id = arr.reduce((a, b) => a.id > b.id ? a : b).id + 1;
            arr.push(copy);
            this.setState({ currentControl: copy });
        }
    }

    selectControl = (e, dir, ref) => {
        let arr = this.props.todoList.draggables;
        let index = ref ? ref.id : e.target.id;
        let control = arr.find((el) => el.id == index);
        this.setState({ currentControl: control });
    }

    unselectControl = (e) => {
        if (e.target.id != 'drag') return;
        this.setState({ currentControl: null });
    }

    handlePosition = (e, data) => {
        if (!this.state.currentControl) return;
        this.state.currentControl.x = data.x;
        this.state.currentControl.y = data.y;
        this.setState({ currentControl: this.state.currentControl });
    }

    handleChange = (e, prop) => {
        let text = e.target.value;
        if ((prop === 'height' || prop === 'width') && text > 2000) return;
        if (prop === 'borderWidth' && text > 30) return;
        if (prop === 'borderRadius' && text > 100) return;
        this.state.currentControl[prop] = text;
        this.setState({ currentControl: this.state.currentControl });
    }

    handleState = (e, prop) => {
        let value = e.target.value;
        let newState = {};
        if ((prop == 'height' || prop == 'width') && value > 2000) return;
        newState[prop] = value;
        this.props.todoList[prop] = value;
        this.setState(newState);
    }

    render() {
        const auth = this.props.auth;
        let todoList = this.props.todoList;
        let control = {};

        if (!auth.uid) {
            return <Redirect to="/" />;
        }

        if (!todoList)
            return <React.Fragment />

        if (!this.changedTime) {
            this.changedTime = true;
            this.updateTime();
        }

        if (this.state.currentControl) {
            control = this.state.currentControl;
        }

        return (
            <Row>
                <Col
                    s={3}
                >
                    <div className="grey lighten-2 center-align" style={{ height: '800px' }}>
                        <Row style={{ paddingTop: '20px', borderBottom: '1px solid black' }}>
                            <Col l={3}><img onClick={this.zoomIn} src={ZoomIn} /></Col>
                            <Col l={3}><img onClick={this.zoomOut} src={ZoomOut} /></Col>
                            <Col l={3}><a onClick={this.saveWireframe}>Save</a></Col>
                            <Col l={3}><Link to="/">Close</Link></Col>
                        </Row>
                        <div className="container" style={{ margin: '70px' }} onClick={() => this.addDraggable('container')}>
                            <div className="col m8 offset-m2 container-example"></div>
                            <div className="">Container</div>
                        </div>

                        <div className="container" style={{ margin: '70px' }} onClick={() => this.addDraggable('label')}>
                            <div>Prompt for Label</div>
                            <b>Label</b>
                        </div>

                        <div className="container" style={{ margin: '70px' }} onClick={() => this.addDraggable('button')}>
                            <div><Button>Submit</Button></div>
                            <b>Button</b>
                        </div>

                        <div className="container" style={{ margin: '70px' }} onClick={() => this.addDraggable('textfield')}>
                            <div className="col m8 offset-m2"><TextInput label="Input" /></div>
                            <b>Textfield</b>
                        </div>
                    </div>
                </Col>
                <Col
                    s={6}
                >
                    <div className="grey lighten-2 center-align" onKeyDown={this.keyListener} tabIndex="0" style={{ height: '800px', overflow: 'scroll' }}>
                        <div className="drag-box" id="drag" onMouseDown={this.unselectControl} style={{ height: todoList.height + 'px', width: todoList.width + 'px', transform: `scale(${todoList.scale})`, overflow: 'hidden' }}>
                            {todoList.draggables.map((item) => {
                                let position = {
                                    x: item.x,
                                    y: item.y
                                }
                                let style = {
                                    width: item.width,
                                    height: item.height,
                                    fontSize: item.fontSize + 'pt',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: item.backgroundColor,
                                    borderStyle: 'solid',
                                    borderColor: item.borderColor,
                                    color: item.color,
                                    borderWidth: item.borderWidth + 'px',
                                    borderRadius: item.borderRadius + 'px',
                                }
                                let inputStyle = {
                                    width: item.width,
                                    height: item.height,
                                    fontSize: item.fontSize + 'pt',
                                    backgroundColor: item.backgroundColor,
                                    color: item.color,
                                    borderWidth: item.borderWidth + 'px',
                                    borderRadius: item.borderRadius + 'px',
                                }

                                let divElement;
                                if (item.type === 'container') {
                                    divElement = <div className="container-control" id={item.id} style={style}></div>;
                                } else if (item.type === 'label') {
                                    divElement = <div id={item.id} style={style}>{item.text}</div>
                                } else if (item.type === 'button') {
                                    divElement = <div id={item.id} style={style} className="psuedo-button-wrapper">{item.text}</div>
                                } else {
                                    divElement = <input type="text" style={inputStyle} id={item.id} value={item.text} disabled />
                                }
                                return (
                                    <Rnd
                                        bounds="parent"
                                        className={item === this.state.currentControl ? 'selected-control' : ''}
                                        id={item.id}
                                        size={{ width: item.width, height: item.height }}
                                        position={{ x: item.x, y: item.y }}
                                        onDragStart={this.selectControl}
                                        onDragStop={this.handlePosition}
                                        onResizeStart={this.selectControl}
                                        onResize={(e, direction, ref, delta, position) => {
                                            let con = this.state.currentControl;
                                            con.width = ref.style.width;
                                            con.height = ref.style.height;
                                            con.x = position.x;
                                            con.y = position.y;
                                            this.setState({ currentControl: this.state.currentControl });
                                        }}
                                    >
                                        {divElement}
                                    </Rnd>
                                );
                            })}
                        </div>
                    </div>
                </Col>
                <Col
                    s={3}
                >
                    <div className="col s12 grey lighten-2 center-align" style={{ height: '800px' }}>
                        <h4>Properties</h4>
                        {(this.state.currentControl) ?
                            (this.state.currentControl.type === 'container') ?
                                <div className="col s12">
                                    <TextInput type="number" label="Border Thickness" onChange={(e) => this.handleChange(e, 'borderWidth')} value={control.borderWidth + '' || ''} />
                                    <TextInput type="number" label="Border Radius" onChange={(e) => this.handleChange(e, 'borderRadius')} value={control.borderRadius + '' || ''} />
                                    <div className="row">
                                        <div className="col s6">Background Color</div>
                                        <input className="col s2" value={control.backgroundColor || '#ffffff'} type="color" onChange={(e) => this.handleChange(e, 'backgroundColor')} onInput={(e) => this.handleChange(e, 'backgroundColor')} />
                                    </div>
                                    <div className="row">
                                        <div className="col s6">Border Color</div>
                                        <input className="col s2" value={control.borderColor || '#ffffff'} type="color" onChange={(e) => this.handleChange(e, 'borderColor')} onInput={(e) => this.handleChange(e, 'borderColor')} />
                                    </div>
                                </div> :
                                <div className="col s12">
                                    <TextInput label="Text" onChange={(e) => this.handleChange(e, 'text')} value={control.text || ''} />
                                    <TextInput type="number" label="Font Size" onChange={(e) => this.handleChange(e, 'fontSize')} value={control.fontSize + '' || ''} />
                                    <TextInput type="number" label="Border Thickness" onChange={(e) => this.handleChange(e, 'borderWidth')} value={control.borderWidth + '' || ''} />
                                    <TextInput type="number" label="Border Radius" onChange={(e) => this.handleChange(e, 'borderRadius')} value={control.borderRadius + '' || ''} />
                                    <div className="row">
                                        <div className="col s6">Background Color</div>
                                        <input className="col s2" value={control.backgroundColor || '#ffffff'} type="color" onChange={(e) => this.handleChange(e, 'backgroundColor')} onInput={(e) => this.handleChange(e, 'backgroundColor')} />
                                    </div>
                                    <div className="row">
                                        <div className="col s6">Border Color</div>
                                        <input className="col s2" value={control.borderColor || '#ffffff'} type="color" onChange={(e) => this.handleChange(e, 'borderColor')} onInput={(e) => this.handleChange(e, 'borderColor')} />
                                    </div>
                                    <div className="row">
                                        <div className="col s6">Font Color</div>
                                        <input className="col s2" value={control.color || '#ffffff'} type="color" onChange={(e) => this.handleChange(e, 'color')} onInput={(e) => this.handleChange(e, 'color')} />
                                    </div>
                                </div> :
                            <div className="col s12">
                                <TextInput label="Wireframe Name" onChange={(e) => this.handleState(e, 'name')} value={this.props.todoList.name || ''} />
                                <TextInput label="Height" onChange={(e) => this.handleState(e, 'height')} value={this.props.todoList.height || ''} />
                                <TextInput label="Width" onChange={(e) => this.handleState(e, 'width')} value={this.props.todoList.width || ''} />
                            </div>
                        }
                    </div>
                </Col>
            </Row >
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const { id } = ownProps.match.params;
    const { todoLists } = state.firestore.data;
    const todoList = todoLists ? todoLists[id] : null;
    if (todoList)
        todoList.id = id;

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
)(EditScreen);