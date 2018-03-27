module UserBids.State exposing (..)

import UserBids.Types exposing (..)
import UserBids.Rest exposing (getUserBids)


init : (Model, Cmd Msg)
init = ({bids = []}, getUserBids)


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Noop ->
            (model, Cmd.none)

        SetBids bids ->
            ({model | bids = bids}, Cmd.none)


subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
