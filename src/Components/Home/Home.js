import React from "react";
import axios from "axios";
import logo_color from "../../Assets/logo_color.png"
import logo_tpi from "../../Assets/logo_TPI.png"
import "antd/dist/antd.css";
import { LoadingOutlined } from '@ant-design/icons';
import {List, Divider, Modal} from 'antd';
import {Content, BoardContent, InputField, ButtonField, Inputs, ButtonGreen, Title, Subtitle, Number, Countdown, Tile, WhiteTile, DisabledTile, Container} from "./StyledHome";
import "./Home.css";

const path = "http://3.86.110.90:8000/bingo/"

var waitNumber, waitStart;


class Home extends React.Component {
    board = {}

    constructor(props) {
        super(props);
        this.state = {
            state: 0,
            nickname: null,
            idgame: null,
            board: null,
            owns: false,
            waiting: false,
            started: false,
            number: '',
            count: 60
        };
        this.loadData();
        console.log(this.state);
    }

    componentDidMount() {
        console.log(this.state);
    }

    loadData = () => {
        axios.get(path + "terms").then(response => {
            for(const  e in response.data){
                if(e === "0")
                    this.board["75"] = {num: "75", text: response.data[e][0], check: false}
                else
                    this.board[e] = {num: e, text: response.data[e][0], check: false}
            }
            axios.get(path + "definitions").then(response => {
                for(const e in response.data){
                    if( e === "0")
                        this.board["75"].desc = response.data[e].substring(2,response.data[e].length-2);
                    else
                        this.board[e].desc = response.data[e].substring(2,response.data[e].length-2);
                }
            });
        }).catch(error => {
            Modal.error({
                title: "Error",
                content: "Error en el servidor, por favor espere unos minutos e ínténtelo nuevamente.",
                centered: true
            });
        });
    }

    getSeconds = () => {
        let seconds = 19 - ( new Date().getSeconds() + 2 )% 20
        this.setState({count: seconds})
        if (seconds === 0) {
            axios.post(path + "balot", {
                    "idgame": this.state.idgame,
                    "nickname": this.state.nickname
            }).then(response => {
                if(response.data.balota+"" === "0"){
                    this.setState({owns: false, waiting: false, started: false});
                } else if(response.data.balota+""[0] === 'X') {
                    this.setState({owns: false, waiting: false, started: false});
                    this.finishGame(response.data.balota.substring(1, response.data.balota.length));
                }else
                    this.setState({number: response.data.balota});
            }).catch(error => {
            });
        }
    }

    finishGame = (nick) => {
        Modal.info({
            title: "Terminó la partida",
            content: "El usuario "+nick+" acaba de ganar la partida, crea una nueva sala y vuelve a intentarlo.",
            centered: true})
    }

    getSecondsDelay = () => {
        let seconds = 19 - ( new Date().getSeconds() ) % 20
        this.setState({count: seconds})
        if (seconds === 0) {
            axios.post(path + "balot", {
                "idgame": this.state.idgame,
                "nickname": this.state.nickname
            }).then(response => {
                this.setState({number: response.data.balota});
            }).catch(error => {
            });
        }
    }

    waitForStart = () => {
        setTimeout(() =>{
                waitStart = setInterval(this._waitForStart,1000);
            }
        , (19 - new Date().getSeconds()%20)*1000 + (1005 - new Date().getMilliseconds()) );
    }

    _waitForStart = () => {
        axios.post(path + "balot", {
                "idgame": this.state.idgame,
                "nickname": this.state.nickname
        }).then(response => {
            console.log("Response: ");
            console.log(response)
            if(response.data.balota !== "0" ){
                this.setState({started: true, waiting: false, number: response.data.balota});
                waitNumber = setInterval(this.getSecondsDelay,500);
                clearInterval(waitStart);
            }
        });
    }


    createRoom = async () => {
        if(this.state.nickname !== null && this.state.nickname !== "") {
            axios.get(path + "newgame").then(response => {
                this.setState({
                    state: 2,
                    idgame: response.data.idgame,
                    owns: true,
                    waiting: false
                });
                axios.post(path + "enter", {
                    "nickname": this.state.nickname,
                    "idgame": response.data.idgame
                }).then(response => {
                        this.setState({
                            state: 1,
                            board: response.data.board.substring(2, response.data.board.length - 2).split(";")
                        });
                    }
                ).catch(error => {
                });
            });
        } else {
            Modal.error({
                title: "Error",
                content: "Por favor ingrese un nombre de usuario.",
                centered: true
            });
        }
    }

    joinRoom = () => {
        if(this.state.nickname !== null && this.state.idgame !== null && this.state.nickname !== "" && this.state.idgame !== "") {
            axios.post(path + "enter", {
                "nickname": this.state.nickname,
                "idgame": this.state.idgame
            }).then(response => {
                    this.setState({
                        state: 1,
                        board: response.data.board.substring(2, response.data.board.length - 2).split(";"),
                        waiting: true
                    });
                    this.waitForStart();
                }
            ).catch(error => {
                Modal.error({
                    title: "",
                    content: "No se encontró ninguna partida con el código indicado. Por favor verifique el código e inténtelo nuevamente",
                    centered: true
                });
            });
        } else {
            Modal.error({
                title: "Error",
                content: "Por favor ingrese un nombre de usuario.",
                centered: true
            });
        }
    }


    startRoom = () => {
        axios.post(path + "enter",{
            "nickname": this.state.nickname,
            "idgame": this.state.idgame
        }).then(response => {
                this.setState({
                    board: response.data.board.substring(2, response.data.board.length-2).split(";"),
                    waiting: true
                });
                setTimeout(
                    this._startRoom,
                (19 - new Date().getSeconds()%20)*1000 + (1000 - new Date().getMilliseconds()) );
            }
        ).catch(error => {
        });

    }

    _startRoom = () => {
        axios.post(path + "enter",{
            "nickname": this.state.nickname,
            "idgame": this.state.idgame
        }).then(response => {
                axios.post(path + "balot", {
                    "idgame": this.state.idgame,
                    "nickname": this.state.nickname
                }).then(response => {
                    this.setState({number: response.data.balota});
                    waitNumber = setInterval(this.getSeconds,1000);
                    this.setState({
                        started: true,
                        state: 1,
                        waiting: false
                    });
                }).catch(error => {
                });
            }
        ).catch(error => {
        });
    }

    checkTile = (tile) => {
        if(this.state.number === tile) {
            this.board[tile].check = true;
            Modal.success({
                title: this.board[tile].text,
                content: this.board[tile].desc,
                centered: true
            });
        }
    }

    checkWinner = () => {
        let check = 0;
        for (let e in this.board) {
            if( this.board[e].check )
                check += 1
        }
        if( check === 24 ) {
            this.setState({owns: false, waiting: false, started: false});
            Modal.success({
                title: "Felicitaciones!",
                content: "Eres el primero en completar todas las casillas, ganaste!",
                centered: true
            });
            axios.post(path + "winner", {
                "idgame": this.state.idgame,
                "nickname": this.state.nickname
            }).then(response => {
            }).catch(error => {
            });
        }else
            Modal.error({
                title: "Lo sentimos",
                content: "Aún te faltan casillas por marcar, vuelve a intentarlo cuando completes el tablero.",
                centered: true
            });
    }

    render() {
        return (
            <div>
                {this.state.state === 0 ?
                    <Content>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <img src={logo_color} className="App-logo" alt="logo" />
                            <img src={logo_tpi} className="App-logo" alt="logo" />
                        </div>
                        <div style={{
                            width: 600,
                            height: 400,
                            border: '#00A550 2px solid',
                            alignItems: 'center',
                            backgroundColor: '#fff',
                            padding: 50,
                            borderRadius: 20,

                        }}>
                            <InputField style={{display: 'flex'}}>
                                Nick:
                                <Inputs placeHolder="Nick" onChange  = { e => this.setState({nickname: e.target.value})}/>
                            </InputField>
                            <InputField style={{display: 'flex'}}>
                                Room code:
                                <Inputs placeHolder="Sala" onChange  = { e => this.setState({idgame: e.target.value})}/>
                            </InputField>
                            <ButtonField>
                                <ButtonGreen variant="contained" color="primary" onClick = {this.joinRoom}>Unirse a partida</ButtonGreen>
                            </ButtonField>
                            <Divider style={{
                                marginTop: 30,
                                marginBottom: 30,
                                width: '60%'
                            }} >
                                O crea una sala
                            </Divider>
                            <ButtonField>
                                <ButtonGreen variant="contained" color="primary" onClick = {this.createRoom}>Crear partida</ButtonGreen>
                            </ButtonField>
                        </div>
                    </Content>
                    :
                    <Content>
                        <img src={logo_color} className="App-logo" alt="logo" />
                        <Container>
                            <Title> Tablero Ambiental </Title>

                            <Subtitle>Sala: {this.state.idgame}</Subtitle>
                            <Subtitle>{this.state.nickname}</Subtitle>

                            { this.state.started ?
                            <div>
                                <Number>
                                    {this.state.number}
                                    <Countdown>
                                        {this.state.count}
                                    </Countdown>
                                </Number>

                                <BoardContent>
                                    <List
                                        grid={{ column: 5 }}
                                        dataSource={this.state.board}
                                        renderItem={item => (
                                            item !== "C" && this.board[item]!== undefined ?(
                                            !this.board[item].check?
                                            <Tile onClick = {() => this.checkTile(item)}>
                                                <p>
                                                    <h1 style={{fontSize: '3em', fontWeight: 'bold'}}>{item}</h1>
                                                </p>
                                                <p>
                                                    {this.board[item].text}
                                                </p>
                                            </Tile> :
                                            <DisabledTile>
                                                <p>
                                                    <h1 style={{fontSize: '3em', fontWeight: 'bold'}}>{item}</h1>
                                                </p>
                                                <p>
                                                    {this.board[item].text}
                                                </p>
                                            </DisabledTile>
                                            ): <WhiteTile>{console.log(this.state)}{ console.log(this.board)}</WhiteTile>
                                        )}
                                    />

                                </BoardContent>
                                <ButtonField>
                                    <ButtonGreen variant="contained" color="primary" onClick = {this.checkWinner}>BINGO!</ButtonGreen>
                                </ButtonField>
                            </div>:
                                this.state.waiting ?
                                    <BoardContent >
                                        <LoadingOutlined style={{ fontSize: '10em', color: '#08c' }} />
                                    </BoardContent> :
                                (this.state.owns?
                                    <BoardContent>
                                        <ButtonField>
                                            <ButtonGreen variant="contained" color="primary" onClick = {this.startRoom}>Empezar partida</ButtonGreen>
                                        </ButtonField>
                                    </BoardContent>:
                                    <BoardContent>
                                        <Subtitle>La partida ha finalizado</Subtitle>
                                    </BoardContent>
                                )
                            }
                        </Container>
                    </Content>
                }
            </div>
        );
    }
}

export default Home;