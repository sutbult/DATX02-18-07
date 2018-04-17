module Browse.State exposing (init, update, subscriptions)

import Browse.Types exposing (..)
import Bid.Types exposing (Value, Bid)

import BidList.Table.Types as TableTypes
import BidList.Table.State as TableState

import Browse.Filter.State as FilterState
import Browse.Accept.State as AcceptState

import Browse.Filter.Types
import Browse.Filter.Part.Types

import Error.State as ErrorState

import Platform.Cmd
import Browse.Rest exposing (getBids)
import Ports

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
                    <| Browse.Filter.Types.From
                    <| Browse.Filter.Part.Types.SetCurrencies
                    <| filterElementsPart .from bids
                , Filter
                    <| Browse.Filter.Types.To
                    <| Browse.Filter.Part.Types.SetCurrencies
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

getFilterElements : List Bid -> (List String, List String)
getFilterElements bid =
    ( filterElementsPart .from bid
    , filterElementsPart .to bid
    )

filterElementsPart : (Bid -> Value) -> List Bid -> List String
filterElementsPart access =
    nub << List.map (.currency << access)

nub : List a -> List a
nub list =
    case list of
        [] ->
            []

        x :: xs ->
            if List.member x xs then
                nub xs
            else
                x :: nub xs

foldMsg : (msg -> model -> (model, Cmd msg)) -> model -> List msg -> (model, Cmd msg)
foldMsg fn model = List.foldl (updateCmd fn) (model, Cmd.none)

updateCmd
    :  (msg -> model -> (model, Cmd msg))
    -> msg
    -> (model, Cmd msg)
    -> (model, Cmd msg)

updateCmd fn msg (model, cmd) =
    let
        (nmodel, ncmd) = fn msg model
    in
        nmodel ! [cmd, ncmd]
