module BidList.NotifiedState exposing
    ( init
    , update
    , subscriptions
    )

import BidList.Types exposing (..)
import BidList.State
import Bid.State exposing
    ( notifyBidChanges
    )


init : Bool -> String -> (Model, Cmd Msg)
init = BidList.State.init


subscriptions : Model -> Sub Msg
subscriptions = BidList.State.subscriptions


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        SetBids bids ->
            let
                (subModel, subCmd) = BidList.State.update (SetBids bids) model
                notifyCmd = notifyBidChanges model.table.bids bids
            in
                (subModel, Cmd.batch [subCmd, notifyCmd])

        _ ->
            BidList.State.update msg model
