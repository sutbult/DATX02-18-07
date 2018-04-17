module Browse.State exposing (init, update, subscriptions)

import Browse.Types exposing (..)
import Bid.Types exposing (Value, Bid)

import BidList.Table.Types as TableTypes
import BidList.Table.State as TableState

import BidList.Filter.Types as FilterTypes
import BidList.Filter.State as FilterState
import BidList.Filter.Part.Types as FilterPartTypes

import Browse.Accept.State as AcceptState


import Error.State as ErrorState

import Platform.Cmd
import Browse.Rest exposing (getBids)
import Ports
import Utils.List exposing (nub)
import Utils.State exposing (foldMsg)


init : (Model, Cmd Msg)
init =
    let
        (tableModel, tableCmd) = TableState.init
        (filterModel, filterCmd) = FilterState.init
        (errorModel, errorCmd) = ErrorState.init
        (acceptModel, acceptCmd) = AcceptState.init
    in
        (   { table = tableModel
            , filter = filterModel
            , error = errorModel
            , accept = acceptModel
            }
        , Cmd.batch
            [ Platform.Cmd.map ToTable tableCmd
            , Platform.Cmd.map Filter filterCmd
            , Platform.Cmd.map Error errorCmd
            , Platform.Cmd.map ToAccept acceptCmd
            , getBids
            ]
        )


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Filter subMsg ->
            let
                (subModel, subCmd) = FilterState.update subMsg (.filter model)
            in
                ({model | filter = subModel}, Platform.Cmd.map Filter subCmd)

        ToTable subMsg ->
            let
                (subModel, subCmd) = TableState.update subMsg (.table model)
            in
                ({model | table = subModel}, Platform.Cmd.map mapTableCmd subCmd)

        Error subMsg ->
            let
                (subModel, subCmd) = ErrorState.update subMsg (.error model)
            in
                ({model | error = subModel}, Platform.Cmd.map Error subCmd)

        ToAccept subMsg ->
            let
                (subModel, subCmd) = AcceptState.update subMsg (.accept model)
            in
                ({model | accept = subModel}, Platform.Cmd.map ToAccept subCmd)

        SetBids bids ->
            foldMsg update model
                [ ToTable <| TableTypes.SetBids bids
                , Filter
                    <| FilterTypes.From
                    <| FilterPartTypes.SetCurrencies
                    <| filterElementsPart .from bids
                , Filter
                    <| FilterTypes.To
                    <| FilterPartTypes.SetCurrencies
                    <| filterElementsPart .to bids
                ]

        UpdateBids ->
            (model, getBids)


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map Filter <| FilterState.subscriptions model.filter
        , Sub.map ToTable <| TableState.subscriptions model.table
        , Sub.map Error <| ErrorState.subscriptions model.error
        , Sub.map ToAccept <| AcceptState.subscriptions model.accept
        , Ports.updateBids <| (\_ -> UpdateBids)
        ]


filterElementsPart : (Bid -> Value) -> List Bid -> List String
filterElementsPart access =
    nub << List.map (.currency << access)
