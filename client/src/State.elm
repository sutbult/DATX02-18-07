module State exposing (init, update, subscriptions)

import Platform.Cmd
import Task

import Types exposing (..)
import Breadcrumb.State
import Browse.State
import Browse.Types
import Browse.Bids.Types exposing (Bid, Value)

init : (Model, Cmd Msg)
init = (
    { browse = Browse.State.init
    , breadcrumb = Breadcrumb.State.init
    }
    -- TODO: Ersätt bluffladdning med riktig laddning av bud
    , Platform.Cmd.map Browse
        <| Task.perform Browse.Types.SetBids
        <| Task.succeed
            [ Bid (Value "Bitcoin" 0.01) (Value "Ethereum" 0.1)
            , Bid (Value "Ethereum" 0.5) (Value "Monero" 5)
            , Bid (Value "Ethereum" 0.1) (Value "Dogecoin" 9001)
            , Bid (Value "Bitcoin" 0.02) (Value "Monero" 2)
            , Bid (Value "Bitcoin cash" 0.3) (Value "Monero" 3)
            ]
    )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case Debug.log "Message" msg of
        Breadcrumb subMsg ->
            let
                (subModel, subCmd) = Breadcrumb.State.update subMsg (.breadcrumb model)
            in
                ({model | breadcrumb = subModel}, Platform.Cmd.map Breadcrumb subCmd)

        Browse subMsg ->
            let
                (subModel, subCmd) = Browse.State.update subMsg (.browse model)
            in
                ({model | browse = subModel}, Platform.Cmd.map Browse subCmd)

subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
