module Browse.Bids.State exposing
    ( init
    , update
    , subscriptions
    )

import Browse.Bids.Types exposing (..)
import Bid.Types exposing (Bid)
import Browse.Bids.Rest exposing
    ( acceptBid
    )
import Ports

init : List Bid -> (Model, Cmd Msg)
init bids = (
    { bids = bids
    , modal = Nothing
    , processing = False
    , sseID = -1
    }, Cmd.none)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Noop ->
            (model, Cmd.none)

        SetBids bids ->
            ({model | bids = bids}, Cmd.none)

        DisplayModal bid ->
            ({model | modal = Just bid}, Cmd.none)

        CancelModal ->
            ({model | modal = Nothing}, Cmd.none)

        AcceptBid bid ->
            if model.sseID >= 0 then
                ({model | processing = True}, acceptBid bid model.sseID)
            else
                (model, Cmd.none)

        EndProcessingBid ->
            ({model
                | processing = False
                , modal = Nothing
            }, Cmd.none)

        GetSSEId id ->
            ({model | sseID = id}, Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions model =
    if model.sseID < 0 then
        Ports.getSSEId GetSSEId
    else if model.processing then
        Ports.acceptBidResponse <| (\_ -> EndProcessingBid)
    else
        Sub.none
