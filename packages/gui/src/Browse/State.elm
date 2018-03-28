module Browse.State exposing (init, update, subscriptions)

import Browse.Bids.Types
import Browse.Types exposing (..)
import Bid.Types exposing (Value, Bid)
import Browse.Bids.State as BidsState
import Browse.Filter.State as FilterState
import Browse.Filter.Types
import Browse.Filter.Part.Types

import Error.State as ErrorState

import Platform.Cmd
import Browse.Rest exposing (getBids)

init : (Model, Cmd Msg)
init =
    let
        (bidsModel, bidsCmd) = BidsState.init []
        (filterModel, filterCmd) = FilterState.init
        (errorModel, errorCmd) = ErrorState.init
    in
        (   { bids = bidsModel
            , filter = filterModel
            , error = errorModel
            }
        , Cmd.batch
            [ Platform.Cmd.map Bids bidsCmd
            , Platform.Cmd.map Filter filterCmd
            , Platform.Cmd.map Error errorCmd
            , getBids
            ]
        )


mapBidsCmd : Browse.Bids.Types.Msg -> Msg
mapBidsCmd msg =
    case msg of
        Browse.Bids.Types.ToError error ->
            Error error

        subMsg ->
            Bids subMsg


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Filter subMsg ->
            let
                (subModel, subCmd) = FilterState.update subMsg (.filter model)
            in
                ({model | filter = subModel}, Platform.Cmd.map Filter subCmd)

        Bids subMsg ->
            let
                (subModel, subCmd) = BidsState.update subMsg (.bids model)
            in
                ({model | bids = subModel}, Platform.Cmd.map mapBidsCmd subCmd)

        Error subMsg ->
            let
                (subModel, subCmd) = ErrorState.update subMsg (.error model)
            in
                ({model | error = subModel}, Platform.Cmd.map Error subCmd)

        SetBids bids ->
            foldMsg update model
                [ Bids <| Browse.Bids.Types.SetBids bids
                , Filter
                    <| Browse.Filter.Types.From
                    <| Browse.Filter.Part.Types.SetCurrencies
                    <| filterElementsPart .from bids
                , Filter
                    <| Browse.Filter.Types.To
                    <| Browse.Filter.Part.Types.SetCurrencies
                    <| filterElementsPart .to bids
                ]

subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map Filter <| FilterState.subscriptions model.filter
        , Sub.map Bids <| BidsState.subscriptions model.bids
        , Sub.map Error <| ErrorState.subscriptions model.error
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
