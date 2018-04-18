module UserBids.State exposing (..)

import Platform.Cmd

import Bid.Types exposing
    ( Bid
    , Value
    , Status(Pending, Finished)
    , statusChanged
    , currencyName
    , amountString
    )
import BidList.Types as BidListTypes
import BidList.State as BidListState
import UserBids.Types exposing (..)
import Ports
import Utils.State exposing
    ( foldMsg
    )


init : (Model, Cmd Msg)
init =
    let
        (bidListModel, bidListCmd) = BidListState.init True "getUserBids"
    in
        (   { bidList = bidListModel
            }
        , Cmd.batch
            [ Platform.Cmd.map mapBidListCmd bidListCmd
            ]
        )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        ToBidList subMsg ->
            let
                (subModel, subCmd) = BidListState.update subMsg (.bidList model)
            in
                ({model | bidList = subModel}, Platform.Cmd.map mapBidListCmd subCmd)

        SetBids bids ->
            foldMsg update model
                [ ToBidList <| BidListTypes.SetBids bids
                , NotifyBidChanges bids
                ]

        NotifyBidChanges bids ->
            let
                oldBids = model.bidList.table.bids
                newBids = mapFirst (\bid -> {bid | status = Pending}) bids
            in
                (model, notifyBidChanges oldBids newBids)


mapFirst : (a -> a) -> List a -> List a
mapFirst fn list =
    case list of
        [] ->
            []

        (x :: rest) ->
            fn x :: rest


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map ToBidList
            <| BidListState.subscriptions model.bidList
        ]


notifyBidChanges : List Bid -> List Bid -> Cmd Msg
notifyBidChanges old new =
    let
        changedBids = statusChanged old new
    in
        notifyPending changedBids


notifyPending : List Bid -> Cmd Msg
notifyPending =
    let
        isPending bid = bid.status == Pending
        toMessage bid =
            Ports.notify
                ( "A bid has been accepted"
                , bidToMessage bid
                )
    in
        Cmd.batch
            << List.map toMessage
            << List.filter isPending


bidToMessage : Bid -> String
bidToMessage bid =
    let
        from = valueToMessage bid.from
        to = valueToMessage bid.to
    in
        "\n" ++ from ++ "  \x21e8  " ++ to


valueToMessage : Value -> String
valueToMessage value =
    let
        currency = currencyName value.currency
        amount = amountString value
    in
        currency ++ ": " ++ amount
