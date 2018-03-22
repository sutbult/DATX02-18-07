module UserBids.State exposing (..)

import UserBids.Types exposing (..)


init : (Model, Cmd Msg)
init = ({bids = []}, Cmd.none)


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Noop ->
            (model, Cmd.none)
            
        SetBids bids ->
            ({model | bids = bids}, Cmd.none)


subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
